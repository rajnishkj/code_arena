package com.raj.arena.service;

import com.raj.arena.model.Visit;
import com.raj.arena.repository.VisitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class VisitService {

    @Autowired
    private VisitRepository visitRepository;

    public synchronized int incrementAndGetCount() {
        Visit visit = visitRepository.findById(1L).orElse(new Visit(0));
        visit.setCount(visit.getCount() + 1);
        visitRepository.save(visit);
        return visit.getCount();
    }
}
