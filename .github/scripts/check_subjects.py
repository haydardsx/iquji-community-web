"""校验已提交的标题与拉取请求标题。"""

import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path


sys.dont_write_bytecode = True
from community_guard import Scan


TYPES = r"(?:feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)"
BRANCH = re.compile(TYPES + r"/[a-z0-9]+(?:-[a-z0-9]+)*")
SUBJECT = re.compile(
    TYPES +
    r"\((?:web|component|editor|i18n|icons|motion|network|preview|query|theme|docs|deps|release|ci|test|build)\)"
    r"!?: ([^\r\n]+)"
)
PLACEHOLDERS = {"update", "fix", "wip", "tmp", "test", "change", "updates", "changes", "todo", "修改", "更新", "测试", "修复"}


def check_branch(branch):
    if len(branch) > 64 or not BRANCH.fullmatch(branch):
        raise SystemExit("Use a branch such as feat/interactive-terminal (up to 64 characters).")


def check(title):
    match = SUBJECT.fullmatch(title)
    if title.isprintable() and len(title) <= 100 and match:
        summary = match[1]
        words = "".join(char for char in summary.casefold() if char.isalnum())
        if (summary == summary.strip() and sum(char.isalnum() for char in summary) >= 2
                and words not in PLACEHOLDERS):
            return
    raise SystemExit("Use a Conventional Commits title with a descriptive summary and a supported scope.")


def check_message(path):
    message = path.read_text(encoding="utf-8")
    clean = subprocess.check_output(["git", "stripspace", "--strip-comments"], input=message, text=True)
    check(clean.partition("\n")[0])
    scanner = Scan()
    scanner.text("commit", clean)
    if scanner.findings:
        raise SystemExit("Commit message failed the public source check.")
    for role in ("GIT_AUTHOR_IDENT", "GIT_COMMITTER_IDENT"):
        identity = subprocess.check_output(["git", "var", role], text=True)
        if not re.fullmatch(r"IQuji Community <community@iqu\.lol> \d+ [+-]\d{4}\n", identity):
            raise SystemExit("Use the project Git maintenance identity for the author and committer.")


def check_event(event_name, event, revision):
    if event_name == "pull_request":
        pull = event["pull_request"]
        check_branch(pull["head"]["ref"])
        check(pull["title"])
        revision = pull["head"]["sha"]
    elif event_name == "merge_group":
        # 合并队列临时提交由 GitHub 生成；组件检查仍使用队列的合并树。
        revision = event["merge_group"]["base_sha"]
    if not re.fullmatch(r"[0-9a-f]{40}", revision):
        raise SystemExit("Invalid commit identifier.")
    subjects = subprocess.check_output(["git", "log", "-z", "--format=%s", revision, "--"])
    for subject in subjects.decode().split("\0")[:-1]:
        check(subject)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    selection = parser.add_mutually_exclusive_group()
    selection.add_argument("--branch")
    selection.add_argument("--commit-message", type=Path)
    args = parser.parse_args()
    if args.branch is not None:
        check_branch(args.branch)
    elif args.commit_message is not None:
        check_message(args.commit_message)
    else:
        check_event(
            os.environ["GITHUB_EVENT_NAME"],
            json.loads(Path(os.environ["GITHUB_EVENT_PATH"]).read_text()),
            os.environ["GITHUB_SHA"],
        )
