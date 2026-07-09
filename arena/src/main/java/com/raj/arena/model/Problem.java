package com.raj.arena.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "problems")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Problem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    @Column(columnDefinition = "TEXT")
    private String description;

    @NotBlank(message = "Input format is required")
    @Column(columnDefinition = "TEXT")
    private String inputFormat;

    @NotBlank(message = "Output format is required")
    @Column(columnDefinition = "TEXT")
    private String outputFormat;

    @Column(columnDefinition = "TEXT")
    private String constraints;

    @NotBlank(message = "Difficulty is required")
    private String difficulty;

    @NotNull(message = "Rating is required")
    private int rating;

    private int avgSolvingTime;

    @JsonManagedReference
    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<TestCase> testCases = new ArrayList<>();

    public String getEloRange() {
        if (rating <= 900) return "0-1000";
        if (rating <= 1300) return "1000-1400";
        if (rating <= 1600) return "1400-1800";
        return "1800+";
    }
}