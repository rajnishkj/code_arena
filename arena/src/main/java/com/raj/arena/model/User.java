package com.raj.arena.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String username;

    @Column(unique = true)
    private String email;

    private int elo;
    private int total_game_time;
    private String encrypted_password;

    @Column(nullable = false)
    @ColumnDefault("true")
    @JsonProperty("isGuest")
    private boolean isGuest = true;

    private LocalDateTime created_at;
}