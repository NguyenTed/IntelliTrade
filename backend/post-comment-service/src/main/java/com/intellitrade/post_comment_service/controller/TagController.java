package com.intellitrade.post_comment_service.controller;

import com.intellitrade.post_comment_service.dto.response.TagDto;
import com.intellitrade.post_comment_service.service.TagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("post-comment/tag")
public class TagController {
    @Autowired
    private TagService tagService;

    @GetMapping("search")
    public ResponseEntity<List<TagDto>> getTagsByKeyword(@RequestParam String keyword) {
        List<TagDto> tags = tagService.getTagsByKeyword(keyword);
        if (tags.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        else return new ResponseEntity<>(tags, HttpStatus.OK);
    }
}
