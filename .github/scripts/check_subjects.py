"""校验已提交的标题与拉取请求标题。"""

import json
import os
import re
import subprocess
from pathlib import Path


SUBJECT = re.compile(
    r"(?:feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)"
    r"\((?:web|component|editor|i18n|icons|motion|network|preview|query|theme|docs|deps|release|ci|test|build)\)"
    r"!?: ([^\r\n]+)"
)
PLACEHOLDERS = {"update", "fix", "wip", "tmp", "test", "change", "updates", "changes", "todo", "修改", "更新", "测试", "修复"}


def check(title):
    match = SUBJECT.fullmatch(title)
    if title.isprintable() and len(title) <= 100 and match:
        summary = match[1]
        words = "".join(char for char in summary.casefold() if char.isalnum())
        if (summary == summary.strip() and sum(char.isalnum() for char in summary) >= 2
                and words not in PLACEHOLDERS):
            return
    raise SystemExit("Use a Conventional Commits title with a descriptive summary and a supported scope.")


def check_event(event_name, event, revision):
    if event_name == "pull_request":
        pull = event["pull_request"]
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
    check_event(
        os.environ["GITHUB_EVENT_NAME"],
        json.loads(Path(os.environ["GITHUB_EVENT_PATH"]).read_text()),
        os.environ["GITHUB_SHA"],
    )
