package com.raj.arena.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Visit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int count;

    public Visit() {}

    public Visit(int count) { this.count = count; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public int getCount() { return count; }
    public void setCount(int count) { this.count = count; }
}
