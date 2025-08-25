import os
def count_articles(data_dir):
    count = 0
    for filename in os.listdir(data_dir):
            if filename.startswith("article_") and filename.endswith(".html"):
                count += 1
    return count
