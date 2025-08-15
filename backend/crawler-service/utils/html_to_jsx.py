from typing import Iterable
from bs4 import BeautifulSoup

VOID_TAGS: set[str] = {
    "area","base","br","col","embed","hr","img",
    "input","link","meta","param","source","track","wbr"
}

ATTR_RENAME = {
    "class": "className",
    "for": "htmlFor",
    "crossorigin": "crossOrigin",
}

def html_to_jsx(fragment_html: str) -> str:
    """
    Chuyển một đoạn HTML sang 'JSX-like string':
    - Đổi tên thuộc tính (class -> className, for -> htmlFor, crossorigin -> crossOrigin)
    - Tự đóng các thẻ rỗng theo phong cách JSX
    """
    soup = BeautifulSoup(fragment_html, "lxml")

    # đổi tên attribute
    for el in soup.find_all(True):
        # rename thuộc tính
        for old, new in ATTR_RENAME.items():
            if el.has_attr(old):
                el.attrs[new] = el.attrs.pop(old)

        # style: giữ nguyên dạng string (nếu bạn muốn dùng trong TSX source code,
        # cần chuyển 'style' sang object JS; nhưng khi lưu chuỗi thì giữ nguyên OK)
        # ví dụ có thể parse & convert nếu cần ở bước render.

    # serialize: tự đóng các void tags
    def serialize(node) -> str:
        if isinstance(node, str):
            return node

        name = node.name.lower() if hasattr(node, "name") else ""
        # build opening tag
        attrs: list[str] = []
        for k, v in node.attrs.items():
            if isinstance(v, list):
                v = " ".join(v)
            # giữ nguyên value, nhưng escape dấu nháy kép
            val = str(v).replace('"', "&quot;")
            attrs.append(f'{k}="{val}"')
        attr_str = (" " + " ".join(attrs)) if attrs else ""

        if name in VOID_TAGS:
            # tự đóng
            return f"<{name}{attr_str} />"

        # children
        inner = "".join(serialize(c) for c in node.children)

        return f"<{name}{attr_str}>{inner}</{name}>"

    # Nếu fragment có nhiều root, gói lại rồi bỏ wrapper khi xuất
    wrapper = soup.new_tag("div")
    # copy tất cả root elements/text vào wrapper
    for child in list(soup.body.children if soup.body else soup.children):
        # BeautifulSoup với 'lxml' có thể không có body nếu là fragment
        try:
            wrapper.append(child.extract())
        except Exception:
            pass

    # Nếu wrapper rỗng (trường hợp fragment có 1 root hoặc parse đặc biệt), fallback dùng soup
    root_children: Iterable = wrapper.children if wrapper.contents else soup.children
    jsx_parts: list[str] = []
    for child in root_children:
        jsx_parts.append(serialize(child))

    return "".join(jsx_parts)
