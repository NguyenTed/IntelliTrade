package com.intellitrade.post_comment_service.service;

import com.intellitrade.post_comment_service.dto.response.TagDto;
import com.intellitrade.post_comment_service.feign.CrawlerInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TagService {
    @Autowired
    CrawlerInterface crawlerInterface;

    public List<TagDto> getTagsByKeyword(String keyword) {
        return crawlerInterface.getTagsByKeyword(keyword);
    }
}
