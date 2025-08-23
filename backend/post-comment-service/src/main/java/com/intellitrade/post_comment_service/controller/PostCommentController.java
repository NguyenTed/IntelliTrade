package com.intellitrade.post_comment_service.controller;

import com.intellitrade.post_comment_service.dto.response.ArticleDto;
import com.intellitrade.post_comment_service.dto.request.PageRequestDto;
import com.intellitrade.post_comment_service.dto.response.PageResponseDto;
import com.intellitrade.post_comment_service.service.PostCommentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("post-comment")
public class PostCommentController {
    @Autowired
    PostCommentService postCommentService;

    @GetMapping("tradingview/ideas")
    public ResponseEntity<PageResponseDto<ArticleDto>> getTradingViewIdeas(@Valid PageRequestDto pageRequestDto) {
        PageResponseDto<ArticleDto> ideas = postCommentService.getTradingViewIdeas(pageRequestDto);
        if (ideas.getContent().isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else return new ResponseEntity<>(ideas, HttpStatus.OK);
    }

    @GetMapping("tradingview/news")
    public ResponseEntity<PageResponseDto<ArticleDto>> getTradingViewNews(@Valid PageRequestDto pageRequestDto) {
        PageResponseDto<ArticleDto> news = postCommentService.getTradingViewNews(pageRequestDto);
        if (news.getContent().isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else return new ResponseEntity<>(news, HttpStatus.OK);
    }

    @GetMapping("ideas/{slug}")
    public ResponseEntity<ArticleDto> getIdeaBySlug(@PathVariable String slug) {
        ArticleDto ideas = postCommentService.getIdeaBySlug(slug);
        return new ResponseEntity<>(ideas, HttpStatus.OK);
    }

    @GetMapping("news/{slug}")
    public ResponseEntity<ArticleDto> getNewsBySlug(@PathVariable String slug) {
        ArticleDto news = postCommentService.getNewsBySlug(slug);
        return new ResponseEntity<>(news, HttpStatus.OK);
    }

    @GetMapping("vnexpress")
    public ResponseEntity<PageResponseDto<ArticleDto>> getVnExpressIdeas(@Valid PageRequestDto pageRequestDto) {
        PageResponseDto<ArticleDto> ideas = postCommentService.getVnExpressIdeas(pageRequestDto);
        if (ideas.getContent().isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else return new ResponseEntity<>(ideas, HttpStatus.OK);
    }
}
