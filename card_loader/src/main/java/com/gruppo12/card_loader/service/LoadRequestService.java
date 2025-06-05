package com.gruppo12.card_loader.service;

import com.gruppo12.card_loader.model.LoadRequest;
import com.gruppo12.card_loader.repository.LoadRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LoadRequestService {

    @Autowired
    private LoadRequestRepository repository;

    public LoadRequest save(LoadRequest request) {
        request.setApproved(false);
        return repository.save(request);
    }

    public List<LoadRequest> findAllLoads() {
        return repository.findAll();
    }

    public List<LoadRequest> findApprovedLoads() {
        return repository.findByApprovedTrue();
    }

    public List<LoadRequest> findPendingLoads() {
        return repository.findByApprovedFalse();
    }

    public List<LoadRequest> findByUserId(String userId) {
        return repository.findByUserId(userId);
    }

    public List<LoadRequest> searchByCardName(String name) {
        return repository.findByCardNameContainingIgnoreCase(name);
    }

    public List<LoadRequest> searchByCardNameAndSet(String name, String set) {
        return repository.findByCardNameContainingIgnoreCaseAndCardSet(name, set);
    }

    public List<LoadRequest> findByCondition(LoadRequest.CardCondition condition) {
        return repository.findByCondition(condition);
    }

    public LoadRequest getTemplateByNameAndSet(String name, String set) {
        List<LoadRequest> matches = searchByCardNameAndSet(name, set);
        if (!matches.isEmpty()) {
            LoadRequest match = matches.get(0);
            LoadRequest template = new LoadRequest();
            template.setCardName(match.getCardName());
            template.setCardSet(match.getCardSet());
            template.setSetNumber(match.getSetNumber());
            // lascia vuoti userId, price, condition, approved
            return template;
        }
        return null;
    }

    public LoadRequest approveLoadById(String id) {
        LoadRequest request = repository.findById(id).orElseThrow();
        request.setApproved(true);
        return repository.save(request);
    }
}