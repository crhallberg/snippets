import json
import re
import requests

r = requests.get(
    'https://raw.githubusercontent.com/tailwindcss/tailwindcss/master/stubs/defaultConfig.stub.js')

root = ":root {"


def toJSON(str):
    json = re.sub(r",\n[ ]+}", "}", str)
    json = re.sub(r'\n([ ]+)([^:"\'\n]+):', r'\n\1"\2":', json)
    return json.replace("'", '"')


# Colors
jsonText = r.text.split("},\n    colors: ", 1)[1]
jsonText = jsonText.split(",\n    spacing:", 1)[0]
# print(jsonText)
colors = json.loads(toJSON(jsonText))
for c in colors:
    if (c in ["transparent", "black", "white"]):
        continue
    for shade in colors[c]:
        root += "--%s-%s: %s;\n" % (c, shade, colors[c][shade])

# Shadows
jsonText = r.text.split("boxShadow: ", 1)[1]
jsonText = jsonText.split(",\n    container", 1)[0]
shadows = json.loads(toJSON(jsonText))
for s in shadows:
    if s == "none":
        continue
    if s == "default":
        root += "--shadow: %s;\n" % shadows[s]
    else:
        root += "--shadow-%s: %s;\n" % (s, shadows[s])

# Fonts
jsonText = r.text.split("fontFamily: ", 1)[1]
jsonText = jsonText.split(",\n    fontSize", 1)[0]
jsonText = jsonText.replace('"', '\\"') # escape
jsonText = re.sub(r"[ ]{2,}", "", jsonText) # un-indent
jsonText = jsonText.replace("\n", " ") # flatten
jsonText = jsonText.replace(", ], ", ",\n  ")
jsonText = jsonText.replace("{", "{\n ")
jsonText = jsonText.replace("'", "") # remove single-quotes
jsonText = jsonText.replace("[ ", '"') # replace brackets
jsonText = jsonText.replace(",\n", '",\n') # close strings
jsonText = jsonText.replace(",\n}", '\n}') # remove dangling comma
print(toJSON(jsonText))
fonts = json.loads(toJSON(jsonText))
for f in fonts:
    root += "--font-%s: %s;\n" % (f, fonts[f])

with open("tailwind-vars.css", "w", encoding="utf-8") as file:
    file.write(root + "}")
