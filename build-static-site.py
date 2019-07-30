import getopt
import htmlmin
import re
import os
import sys
import time

layout_re = re.compile(r'<layout src="([^"]+)"[^\/]*\/>') # TODO: Add dir classes
partial_re = re.compile(r'<partial src="([^"]+)"[^\/]*\/>')
var_re = re.compile(r'<variable name="([^"]+)" value="([^"]+)"[^\/]*\/>')

vars = {}

def replace_partials(content=None, path=None):
    global layout_re, partial_re, var_re, vars
    partial_cache = {}

    if path is not None:
        content: str = open(path, "r", encoding="utf-8").read()

    # Variables
    var_match: re.Match = var_re.search(content)
    while(var_match):
        var_name = var_match.group(1)
        var_value = var_match.group(2)
        vars[var_name] = var_value
        print("# %s = %s" % (var_name, var_value))
        content = content.replace(var_match.group(0), "")
        var_match: re.Match = var_re.search(content)

    for var in vars:
        content = re.sub("<<%s>>" % var, vars[var], content)

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


def build_pages(src_dir, out_dir):
    for dirpath, dirnames, filenames in os.walk(src_dir):
        for filename in filenames:
            path_parts = [p for p in os.path.split(dirpath) if p][1:]
            src_path = os.path.join(src_dir, *path_parts, filename)
            out_path = os.path.join(out_dir, *path_parts)
            if not os.path.exists(out_path):
                os.mkdir(out_path)
            with open(os.path.join(out_path, filename), "w", encoding="utf-8") as output:
                print("\n%s" % src_path)
                # output.write(htmlmin.minify(replace_partials(path=src_path)))
                output.write(replace_partials(path=src_path))


def watch(files, func):
    file_dates = {}
    for path in files:
        if os.path.isfile(path):
            file_dates[path] = os.stat(path).st_mtime
            continue
        for dirpath, dirnames, filenames in os.walk(path):
            for file in filenames:
                fpath = os.path.join(dirpath, file)
                file_dates[fpath] = os.stat(fpath).st_mtime

    func()
    print("\n======= Watching =======")
    while True:
        time.sleep(.5)
        for path in file_dates:
            if not os.path.exists(path):
                del file_dates[path]
                continue
            mtime = os.stat(path).st_mtime
            if file_dates[path] != mtime:
                file_dates[path] = mtime
                print("\n======= Running watch func (%s) =======" %
                      time.asctime())
                func()
                break


opts, args = getopt.getopt(sys.argv[1:], "", ["watch"])
if len(opts) > 0:
    watch(["pages/", "inc/"], lambda: build_pages("pages/", "output/"))
else:
    build_pages("pages/", "output/")
