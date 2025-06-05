package com.gruppo12.card_loader.controller;

import com.gruppo12.card_loader.model.LoadRequest;
import com.gruppo12.card_loader.service.LoadRequestService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController
@RequestMapping("/api/load")
public class LoadController {

    @Autowired
    private LoadRequestService loadRequestService;

    @PostMapping
    public LoadRequest createLoadRequest(@Valid @RequestBody LoadRequest request) {
        request.setApproved(false);
        return loadRequestService.save(request);
    }

    @GetMapping("/pending")
    public List<LoadRequest> getPendingLoads() {
        return loadRequestService.findPendingLoads();
    }

    @PutMapping("/approve/{id}")
    public LoadRequest approveLoad(@PathVariable String id) {
        return loadRequestService.approveLoadById(id);
    }

    @GetMapping("/all")
    public List<LoadRequest> getAllLoads() {
        return loadRequestService.findAllLoads();
    }

    @GetMapping("/user/{userId}")
    public List<LoadRequest> getLoadsByUser(@PathVariable String userId) {
        return loadRequestService.findByUserId(userId);
    }

    @GetMapping("/approved")
    public List<LoadRequest> getApprovedLoads() {
        return loadRequestService.findApprovedLoads();
    }

    @GetMapping("/search/by-name")
    public List<LoadRequest> searchByCardName(@RequestParam String name) {
        return loadRequestService.searchByCardName(name);
    }

    @GetMapping("/search/by-condition")
    public List<LoadRequest> filterByCondition(@RequestParam LoadRequest.CardCondition condition) {
        return loadRequestService.findByCondition(condition);
    }

    @GetMapping("/template")
    public LoadRequest getTemplateByNameAndSet(@RequestParam String name, @RequestParam String set) {
        return loadRequestService.getTemplateByNameAndSet(name, set);

    }

    @GetMapping("/conditions")
    public LoadRequest.CardCondition[] getCardConditions() {
        return LoadRequest.CardCondition.values();
    }
}