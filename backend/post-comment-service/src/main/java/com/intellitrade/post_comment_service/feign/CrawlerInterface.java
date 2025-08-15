package com.intellitrade.post_comment_service.feign;

import com.intellitrade.post_comment_service.dto.request.CommentRequest;
import com.intellitrade.post_comment_service.dto.response.*;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "crawlerClient", url = "${crawler-service.base-url}")
public interface CrawlerInterface {
    @GetMapping("tradingview")
    PageResponseDto<ArticleDto> getTradingViewArticles(
            @RequestParam("page") int page,
            @RequestParam("size") int size,
            @RequestParam("sortBy") String sortBy,
            @RequestParam("sortDirection") String sortDirection
    );

    @GetMapping("vnexpress")
    PageResponseDto<ArticleDto> getVnExpressArticles(
            @RequestParam("page") int page,
            @RequestParam("size") int size,
            @RequestParam("sortBy") String sortBy,
            @RequestParam("sortDirection") String sortDirection
    );

    @PostMapping("comment")
    CommentDto saveComment(CommentRequest request);

    @GetMapping("/tag/search")
    List<TagDto> getTagsByKeyword(@RequestParam("keyword") String keyword);

    @GetMapping("/tag/search")
    List<SymbolDto> getSymbolsByKeyword(@RequestParam("keyword") String keyword);

    @GetMapping("/{slug}")
    ArticleDto getArticleBySlug(@PathVariable String slug);
}
