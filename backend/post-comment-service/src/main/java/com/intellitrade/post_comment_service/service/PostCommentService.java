package com.intellitrade.post_comment_service.service;

import com.intellitrade.post_comment_service.dto.response.ArticleDto;
import com.intellitrade.post_comment_service.dto.request.PageRequestDto;
import com.intellitrade.post_comment_service.dto.response.PageResponseDto;
import com.intellitrade.post_comment_service.feign.CrawlerInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PostCommentService {

    @Autowired
    CrawlerInterface crawlerInterface;

    public PageResponseDto<ArticleDto> getTradingViewArticles(PageRequestDto pageRequestDto) {
        return crawlerInterface.getTradingViewArticles(pageRequestDto.getPage(), pageRequestDto.getSize(), pageRequestDto.getSortBy(), pageRequestDto.getSortDirection());
    }

    public PageResponseDto<ArticleDto> getVnExpressArticles(PageRequestDto pageRequestDto) {
        return crawlerInterface.getVnExpressArticles(pageRequestDto.getPage(), pageRequestDto.getSize(), pageRequestDto.getSortBy(), pageRequestDto.getSortDirection());
    }

    public ArticleDto getArticleBySlug(String slug) {
        return crawlerInterface.getArticleBySlug(slug);
    }
}
