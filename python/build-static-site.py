import htmlmin
import re
import os

partial_cache = {}
layout_re = re.compile(r'<layout src="([^"]+)"[^\/]*\/>')
partial_re = re.compile(r'<partial src="([^"]+)"[^\/]*\/>')


def replace_partials(content=None, path=None):
    global layout_re, partial_re

    if path is not None:
        content: str = open(path, "r", encoding="utf-8").read()

    # Layout
    layout: re.Match = layout_re.search(content)
    if layout:
        layout_src = layout.group(1)
        print("=", layout_src)
        if layout_src not in partial_cache:
            partial_cache[layout_src] = replace_partials(path=layout_src)
        content = partial_cache[layout_src].replace(
            "<<content>>",
            content.replace(layout.group(0), "")  # remove layout call
        )

    # Partials
    match: re.Match = partial_re.search(content)
    if not match:
        return content
    while(match):
        partial = match.group(1)
        print(">", partial)
        if partial not in partial_cache:
            partial_cache[partial] = replace_partials(path=partial)
        content = content.replace(match.group(0), partial_cache[partial])
        match = partial_re.search(content, pos=match.end())
    return replace_partials(content=content)


for dirpath, dirnames, filenames in os.walk("pages"):
    for filename in filenames:
        path_parts = [p for p in os.path.split(dirpath) if p][1:]
        src_path = os.path.join("pages", *path_parts, filename)
        out_path = os.path.join("output", *path_parts)
        if not os.path.exists(out_path):
            os.mkdir(out_path)
        with open(os.path.join(out_path, filename), "w", encoding="utf-8") as output:
            print("\n%s" % src_path)
            output.write(htmlmin.minify(replace_partials(path=src_path)))
