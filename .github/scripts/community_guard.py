#!/usr/bin/env python3
"""检查固定 Git 树及待发布的 npm 压缩包。仅输出规则和位置，隐藏命中内容。"""
import argparse
import hashlib
import ipaddress
import json
import os
from pathlib import Path, PurePosixPath
import re
import struct
import subprocess
import tarfile
import sys

MAX_FILE = 16 * 1024 * 1024
MAX_ARCHIVE = 128 * 1024 * 1024
DOC_NAMES = {"README.md", "README.zh-CN.md", "SECURITY.md", "LICENSE.md",
             "NOTICE.md", "THIRD_PARTY_NOTICES.md", "THIRD-PARTY-NOTICES.md"}
IGNORED_DIRS = {".cache", ".git", "node_modules", "coverage", "__pycache__", ".idea",
                ".vscode", ".terraform", ".ssh", ".aws", ".gnupg", "target", ".next"}
PRIVATE_EXT = {".pem", ".p12", ".pfx", ".key", ".sqlite", ".sqlite3", ".db", ".log",
               ".har", ".pcap", ".pcapng", ".mobileprovision", ".map", ".docx",
               ".pptx", ".xlsx", ".pdf", ".bak", ".tgz", ".gz", ".zip", ".7z", ".tar"}
PRIVATE_NAMES = {"id_rsa", "id_ed25519", ".netrc", ".npmrc", ".ds_store", ".envrc",
                 ".git-credentials", "agents.md", "claude.md", "history", ".terraformrc"}
SENSITIVE = {
    "private-key": re.compile(r"-----BEGIN (?:[A-Z0-9]+ )*PRIVATE KEY-----"),
    "provider-token": re.compile(r"\b(?:gh[pousr]_[0-9A-Za-z]{30,}|github_pat_[A-Za-z0-9_]{40,}|npm_[A-Za-z0-9]{30,}|AKIA[0-9A-Z]{16}|xox[baprs]-[A-Za-z0-9-]{16,})"),
    "home-path": re.compile(r"(?i)(?:/Users/|/home/|[A-Z]:[\\/]Users[\\/])(?!runner(?:[\\/\s]|$)|node(?:[\\/\s]|$))([\w.-]+)[\\/]"),
    "credential-in-url": re.compile(r"\b(?:https?|ssh|mongodb(?:\+srv)?|postgres(?:ql)?|mysql)://[^\s/@:$<>{}]+:[^\s/@$<>{}]+@", re.I),
    "inline-source-map": re.compile(r"sourceMappingURL\s*=\s*data:", re.I),
    "device-id": re.compile(r"(?i)\b(?:device[_ -]?(?:uuid|serial)|machine[_ -]?id|hardware[_ -]?uuid)[\s\x22\x27:=]+[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}\b"),
    "ssh-fingerprint": re.compile(r"(?i)\bSHA256:[A-Za-z0-9+/]{43}(?:=|\b)"),
}
EMAIL = re.compile(r"(?i)(?<![\w.+-])[A-Z0-9._%+\-]+@(?:[A-Z0-9-]+\.)+[A-Z]{2,63}(?![\w.-])")
IPV6 = re.compile(r"(?<![0-9A-Za-z:])(?:[0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}(?![0-9A-Za-z:.])")
MAC = re.compile(r"(?i)(?<![0-9a-f:])(?:[0-9a-f]{2}:){5}[0-9a-f]{2}(?![0-9a-f:])")
IPV4 = re.compile(r"(?<![\w.])(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?![\w.])")
SAFE_NETS = tuple(ipaddress.ip_network(n) for n in
                  ("127.0.0.0/8", "192.0.2.0/24", "198.51.100.0/24", "203.0.113.0/24"))
STANDARD_CIDRS = {"0.0.0.0/8", "10.0.0.0/8", "100.64.0.0/10", "127.0.0.0/8",
                  "169.254.0.0/16", "172.16.0.0/12", "192.168.0.0/16", "224.0.0.0/4", "240.0.0.0/4"}
NEUTRAL_DOMAINS = {"example.com", "example.net", "example.org", "example", "invalid", "test"}

def neutral_email(value):
    host = value.rsplit("@", 1)[1].lower()
    return value.lower() in {"noreply@github.com", "community@iqu.lol"} or host == "users.noreply.github.com" or any(
        host == domain or host.endswith("." + domain) for domain in NEUTRAL_DOMAINS)

def git(repo, *args):
    return subprocess.check_output(["git", "-C", repo, *args], stderr=subprocess.DEVNULL)

def component_path(name):
    path = PurePosixPath(name)
    return bool(name and not path.is_absolute() and "\\" not in name and
                not any(part in {"", "..", "."} for part in name.split("/")) and
                all(ord(ch) >= 32 and ord(ch) != 127 for ch in name))

class Scan:
    def __init__(self, locations=False):
        self.locations = locations
        self.findings = set()
        self.files = 0
        self.trees = set()
        self.blobs = set()

    def fail(self, rule, name, line=0):
        ref = name if self.locations and component_path(name) else hashlib.sha256(name.encode()).hexdigest()[:12]
        self.findings.add((rule, ref, line))

    def path(self, name, artifact=False):
        path = PurePosixPath(name)
        if not component_path(name) or set(s.lower() for s in path.parts) & IGNORED_DIRS:
            self.fail("restricted-path", name)
        basename = path.name.lower()
        if (basename in PRIVATE_NAMES or path.suffix.lower() in PRIVATE_EXT or
                (basename.startswith(".env") and basename != ".env.example") or
                (not artifact and "dist" in path.parts)):
            self.fail("restricted-file", name)
        if path.suffix.lower() in {".md", ".mdx", ".rst", ".adoc"} and path.name not in DOC_NAMES:
            self.fail("documentation-policy", name)

    def text(self, name, data, legal=False):
        for line_no, line in enumerate(data.splitlines(), 1):
            for rule, pattern in SENSITIVE.items():
                if pattern.search(line):
                    self.fail(rule, name, line_no)
            if not legal and any(not neutral_email(m.group()) for m in EMAIL.finditer(line)):
                self.fail("personal-email", name, line_no)
            for m in MAC.finditer(line):
                value = m.group().lower()
                # IEEE 的文档专用地址段允许作为虚构设备示例。
                if value not in {"00:00:00:00:00:00", "ff:ff:ff:ff:ff:ff"} and not value.startswith(("00:00:5e:00:53:", "00:00:5e:00:01:")):
                    self.fail("device-address", name, line_no)
            for m in IPV6.finditer(line):
                if m.group().endswith("::") and line[m.end():m.end()+1] == "{":
                    continue
                try:
                    addr6 = ipaddress.IPv6Address(m.group())
                except ValueError:
                    continue
                prefix6 = re.match(r"/[0-9]{1,3}(?![0-9])", line[m.end():])
                if prefix6 and str(addr6) + prefix6.group() in {"fc00::/7", "fe80::/10"}:
                    continue
                if (not addr6.is_unspecified and not addr6.is_loopback and
                        addr6 not in ipaddress.IPv6Network("2001:db8::/32")):
                    self.fail("environment-address", name, line_no)
            for m in IPV4.finditer(line):
                try:
                    addr = ipaddress.IPv4Address(m.group())
                except ValueError:
                    continue
                prefix = re.match(r"/[0-9]{1,2}(?![0-9])", line[m.end():])
                if prefix and m.group() + prefix.group() in STANDARD_CIDRS:
                    continue
                if str(addr) not in {"0.0.0.0", "255.255.255.255"} and not any(addr in net for net in SAFE_NETS):
                    self.fail("environment-address", name, line_no)

    def image(self, name, raw):
        suffix = PurePosixPath(name).suffix.lower()
        if suffix == ".png" and raw.startswith(b"\x89PNG\r\n\x1a\n"):
            i = 8
            while i + 12 <= len(raw):
                size, kind = struct.unpack_from(">I4s", raw, i)
                if i + size + 12 > len(raw):
                    break
                if kind in {b"eXIf", b"tEXt", b"zTXt", b"iTXt", b"tIME"}:
                    self.fail("image-metadata", name)
                i += size + 12
                if kind == b"IEND" and i == len(raw):
                    return
        elif suffix in {".ico", ".icns"}:
            if ((suffix == ".ico" and raw.startswith(b"\x00\x00\x01\x00")) or
                    (suffix == ".icns" and raw.startswith(b"icns") and
                     len(raw) == int.from_bytes(raw[4:8], "big"))):
                if any(marker in raw for marker in (b"Exif\x00\x00", b"eXIf", b"tEXt", b"iTXt", b"zTXt", b"tIME", b"<x:xmpmeta", b"Photoshop 3.0")):
                    self.fail("image-metadata", name)
                return
        self.fail("unreviewed-binary", name)

    def blob(self, name, raw):
        self.files += 1
        if len(raw) > MAX_FILE:
            return self.fail("oversize-file", name)
        if b"\x00" in raw:
            return self.image(name, raw)
        try:
            data = raw.decode("utf-8")
        except UnicodeError:
            return self.image(name, raw)
        basename = PurePosixPath(name).name.upper()
        legal = basename.startswith(("LICENSE", "NOTICE", "THIRD_PARTY_NOTICES", "THIRD-PARTY-NOTICES"))
        self.text(name, data, legal)
        if PurePosixPath(name).name in {"README.md", "README.zh-CN.md"}:
            target = "README.zh-CN.md" if name.endswith("/README.md") or name == "README.md" else "README.md"
            if not re.search(r"\((?:\./)?" + re.escape(target) + r"\)", data):
                self.fail("readme-language-link", name)
        if PurePosixPath(name).suffix.lower() == ".svg" and re.search(r"<(?:metadata|dc:creator|rdf:RDF)\b", data, re.I):
            self.fail("image-metadata", name)

    def pairs(self, names):
        for name in names:
            path = PurePosixPath(name)
            if path.name in {"README.md", "README.zh-CN.md"}:
                pair = "README.zh-CN.md" if path.name == "README.md" else "README.md"
                if str(path.with_name(pair)) not in names:
                    self.fail("missing-readme-language", name)

    def tree(self, repo, revision):
        tree = git(repo, "rev-parse", "--verify", "--end-of-options", revision + "^{tree}").decode().strip()
        if tree in self.trees:
            return
        self.trees.add(tree)
        entries = git(repo, "ls-tree", "-rz", tree).split(b"\0")
        names = set()
        with subprocess.Popen(["git", "-C", repo, "cat-file", "--batch"], stdin=subprocess.PIPE,
                              stdout=subprocess.PIPE, stderr=subprocess.DEVNULL) as proc:
            try:
                for entry in filter(None, entries):
                    meta, path = entry.split(b"\t", 1)
                    mode, kind, oid = meta.split()
                    name = path.decode("utf-8")
                    self.path(name)
                    names.add(name)
                    if mode == b"160000" and kind == b"commit":
                        self.fail("external-source", name)
                        continue
                    if mode not in (b"100644", b"100755") or kind != b"blob":
                        self.fail("special-file", name)
                        continue
                    if (name, oid) in self.blobs:
                        continue
                    self.blobs.add((name, oid))
                    proc.stdin.write(oid + b"\n")
                    proc.stdin.flush()
                    _, blobtype, size = proc.stdout.readline().split()
                    if blobtype != b"blob" or int(size) > MAX_FILE:
                        raise ValueError("invalid blob")
                    self.blob(name, proc.stdout.read(int(size)))
                    if proc.stdout.read(1) != b"\n":
                        raise ValueError("invalid git record")
            finally:
                proc.stdin.close()
                proc.terminate()
        self.pairs(names)
        if "README.md" not in names:
            self.fail("missing-root-readme", "README.md")

    def history(self, repo, revision):
        head = git(repo, "rev-parse", "--verify", "--end-of-options", revision + "^{commit}").decode().strip()
        rows = git(repo, "log", "-z", "--format=%H%x00%ae%x00%ce%x00%B", head).split(b"\0")
        for i in range(0, len(rows)-1, 4):
            sha, author, committer, body = [r.decode("utf-8") for r in rows[i:i+4]]
            if not all((addr.lower().endswith("@users.noreply.github.com") or addr.lower() in {"noreply@github.com", "community@iqu.lol"}) for addr in (author, committer)):
                self.fail("commit-identity", sha)
            self.text(sha, body)
            self.tree(repo, sha)

    def site(self, directory):
        base = Path(directory)
        if base.is_symlink() or not base.is_dir() or not (base / "index.html").is_file():
            raise ValueError("invalid site")
        total = 0
        def on_error(error):
            raise error
        for root, dirs, files in os.walk(base, onerror=on_error, followlinks=False):
            for entry in dirs + files:
                path = Path(root, entry)
                name = path.relative_to(base).as_posix()
                self.path(name, artifact=True)
                if path.is_symlink():
                    self.fail("special-file", name)
                    continue
                if entry in dirs:
                    continue
                if not path.is_file() or path.stat().st_size > MAX_FILE:
                    raise ValueError("invalid site file")
                total += path.stat().st_size
                if total > MAX_ARCHIVE:
                    raise ValueError("oversize site")
                self.blob(name, path.read_bytes())

    def registry(self, file):
        doc = json.loads(Path(file).read_bytes())
        expected = os.environ.get("COMMUNITY_RELEASE_EMAIL", "").strip().lower()
        if not expected or not EMAIL.fullmatch(expected):
            raise ValueError("missing verified release identity")
        def visit(item):
            if isinstance(item, list):
                for child in item:
                    visit(child)
            elif isinstance(item, dict):
                for key, value in item.items():
                    if key in {"email", "_email"} and (not isinstance(value, str) or value.lower() != expected):
                        self.fail("registry-identity", "registry.json")
                    visit(value)
            elif isinstance(item, str):
                if any(m.group().lower() != expected and not neutral_email(m.group()) for m in EMAIL.finditer(item)):
                    self.fail("registry-identity", "registry.json")
        if not isinstance(doc, dict) or not doc.get("maintainers"):
            raise ValueError("incomplete registry record")
        visit(doc)

    def artifact(self, file):
        names = set()
        total = 0
        with tarfile.open(file, "r:gz") as archive:
            for member in archive:
                if not member.name.startswith("package/") or not member.isfile() or member.size > MAX_FILE:
                    raise ValueError("invalid package member")
                name = member.name.removeprefix("package/")
                if name in names:
                    raise ValueError("duplicate package member")
                names.add(name)
                total += member.size
                if total > MAX_ARCHIVE:
                    raise ValueError("oversize package")
                self.path(name, artifact=True)
                self.blob(name, archive.extractfile(member).read())
        if not {"package.json", "README.md", "README.zh-CN.md"} <= names:
            self.fail("incomplete-package", "package.json")
        self.pairs(names)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".")
    parser.add_argument("--tree", default="HEAD")
    parser.add_argument("--history", action="store_true", help="核对选定提交的可达提交身份及说明")
    parser.add_argument("--registry", action="append", default=[])
    parser.add_argument("--site", action="append", default=[])
    parser.add_argument("--artifact", action="append", default=[])
    parser.add_argument("--locations", action="store_true", help="在本机显示相对文件名")
    args = parser.parse_args()
    scan = Scan(args.locations)
    try:
        scan.tree(args.repo, args.tree)
        if args.history:
            scan.history(args.repo, args.tree)
        for site in args.site:
            scan.site(site)
        for registry in args.registry:
            scan.registry(registry)
        for artifact in args.artifact:
            scan.artifact(artifact)
    except (OSError, ValueError, tarfile.TarError, subprocess.SubprocessError):
        print("Unable to verify the complete input.", file=sys.stderr)
        return 2
    if args.locations:
        for rule, ref, line in sorted(scan.findings):
            print(f"{ref} {line} {rule}")
    print(f"Checked {scan.files} files, {len(scan.findings)} findings.")
    return int(bool(scan.findings))

if __name__ == "__main__":
    sys.exit(main())
