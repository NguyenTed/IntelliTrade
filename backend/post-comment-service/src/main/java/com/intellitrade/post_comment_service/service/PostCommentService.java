package com.intellitrade.post_comment_service.service;

import com.intellitrade.post_comment_service.dto.response.ArticleDto;
import com.intellitrade.post_comment_service.dto.request.PageRequestDto;
import com.intellitrade.post_comment_service.dto.response.PageResponseDto;
import com.intellitrade.post_comment_service.feign.CrawlerInterface;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PostCommentService {

    @Autowired
    CrawlerInterface crawlerInterface;

    public PageResponseDto<ArticleDto> getTradingViewIdeas(PageRequestDto pageRequestDto) {
        return crawlerInterface.getTradingViewIdeas(pageRequestDto.getPage(), pageRequestDto.getSize(), pageRequestDto.getSortBy(), pageRequestDto.getSortDirection());
    }

    public PageResponseDto<ArticleDto> getVnExpressIdeas(PageRequestDto pageRequestDto) {
        return crawlerInterface.getVnExpressIdeas(pageRequestDto.getPage(), pageRequestDto.getSize(), pageRequestDto.getSortBy(), pageRequestDto.getSortDirection());
    }

    public ArticleDto getIdeaBySlug(String slug) {
        return crawlerInterface.getIdeaBySlug(slug);
    }

    public PageResponseDto<ArticleDto> getTradingViewNews(@Valid PageRequestDto pageRequestDto) {
        return crawlerInterface.getTradingViewNews(pageRequestDto.getPage(), pageRequestDto.getSize(), pageRequestDto.getSortBy(), pageRequestDto.getSortDirection());
    }

    public ArticleDto getNewsBySlug(String slug) {
        return crawlerInterface.getNewsBySlug(slug);
    }
}
