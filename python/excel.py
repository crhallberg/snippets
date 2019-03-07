import re
import xlwings as xw

from math import floor
from string import ascii_uppercase
from xlrd import open_workbook
from xlwings.constants import DeleteShiftDirection


def get_column_letter(number):
    letter = ascii_uppercase[number % 26]
    if (number >= 26):
        letter = get_column_letter(floor(number / 26) - 1) + letter
    return letter


# func returns True for keep, False for remove
def excel_filter_rows(filepath, output, row_func):
    print("\nopening %s to remove rows..." % filepath)
    wb = xw.Book(filepath)
    wb.app.visible = False
    sheet = wb.sheets[0]
    removed = 0
    rownum = sheet.range("A1").current_region.last_cell.row
    for row in range(rownum, 1, -1):
        values = sheet.range("%d:%d" % (row, row)).value
        if not row_func(values, row):
            sheet.range("%d:%d" % (row, row)).api.Delete(
                DeleteShiftDirection.xlShiftUp)
            removed += 1
    wb.save(output)
    print("\tremoved %d rows, saved to %s..." % (removed, output))
    wb.app.kill()


# row_func returns True to highlight
def excel_highlight_rows(filepath, output, row_func, hcolor=(255, 255, 0)):
    print("\nopening %s to highlight rows..." % filepath)
    wb = xw.Book(filepath)
    wb.app.visible = False
    sheet = wb.sheets[0]
    highlighted = 0
    rownum = sheet.range('A1').current_region.last_cell.row
    for row in range(rownum, 1, -1):
        values = sheet.range("%d:%d" % (row, row)).value
        if row_func(values, row):
            sheet.range("%d:%d" % (row, row)).color = hcolor
            highlighted += 1
    wb.save(output)
    print("\thighlighted %d rows, saved to %s..." % (highlighted, output))
    wb.app.kill()


def get_excel_column_by_regex(filepath, column_re):
    rows = []
    pattern = re.compile(column_re)
    with open_workbook(filepath) as book:
        for s in range(book.nsheets):
            sheet = book.sheet_by_index(s)
            columns = {}
            body = False
            row_index = 1
            for row in range(0, sheet.nrows):
                rvalues = sheet.row_values(row)
                if not body:
                    for col in rvalues:
                        if not col:
                            continue
                        if pattern.search(str(col)):
                            columns[col] = rvalues.index(col)
                            body = True
                else:
                    row = {"_number": row_index}
                    for col in columns:
                        row[col] = rvalues[columns[col]]
                    rows.append(row)
                row_index += 1
    return rows
