def get_depth(tag):
    depth = 0
    while tag.parent is not None:
        depth += 1
        tag = tag.parent
    return depth