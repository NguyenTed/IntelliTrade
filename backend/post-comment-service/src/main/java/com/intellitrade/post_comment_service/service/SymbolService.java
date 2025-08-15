package com.intellitrade.post_comment_service.service;

import com.intellitrade.post_comment_service.dto.response.SymbolDto;
import com.intellitrade.post_comment_service.dto.response.TagDto;
import com.intellitrade.post_comment_service.feign.CrawlerInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SymbolService {
    @Autowired
    CrawlerInterface crawlerInterface;

    public List<SymbolDto> getSymbolsByKeyword(String keyword) {
        return crawlerInterface.getSymbolsByKeyword(keyword);
    }
}
