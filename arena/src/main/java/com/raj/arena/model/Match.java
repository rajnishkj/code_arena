package com.raj.arena.model;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "matches")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long p1;
    private Long p2;
    private Long problemId;
    private int p1Time;
    private int p2Time;
    private Long winner;
    private int p1EloChange;
    private int p2EloChange;
}