package com.raj.arena.seeder;

import com.raj.arena.model.Problem;
import com.raj.arena.model.TestCase;
import com.raj.arena.repository.ProblemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final ProblemRepository problemRepository;

    @Override
    public void run(String... args) {
        if (problemRepository.count() > 0) return; // skip if already seeded

        seedProblem1();
        seedProblem2();
        seedProblem3();
        seedProblem4();
        seedProblem5();
    }

    private void seedProblem1() {
        Problem p = new Problem();
        p.setTitle("Sum of Two Numbers");
        p.setDescription("Given two integers A and B, print their sum.");
        p.setInputFormat("Two space-separated integers A and B.");
        p.setOutputFormat("Print a single integer, the sum of A and B.");
        p.setConstraints("1 <= A, B <= 10^9");
        p.setDifficulty("EASY");
        p.setRating(800);
        p.setAvgSolvingTime(60);

        p.setTestCases(List.of(
                tc("3 5", "8", true, p),
                tc("10 20", "30", true, p),
                tc("1000000000 1000000000", "2000000000", false, p),
                tc("0 0", "0", false, p)
        ));

        problemRepository.save(p);
    }

    private void seedProblem2() {
        Problem p = new Problem();
        p.setTitle("Even or Odd");
        p.setDescription("Given an integer N, print EVEN if it is even, otherwise print ODD.");
        p.setInputFormat("A single integer N.");
        p.setOutputFormat("Print EVEN or ODD.");
        p.setConstraints("1 <= N <= 10^9");
        p.setDifficulty("EASY");
        p.setRating(900);
        p.setAvgSolvingTime(45);

        p.setTestCases(List.of(
                tc("4", "EVEN", true, p),
                tc("7", "ODD", true, p),
                tc("1000000000", "EVEN", false, p),
                tc("1", "ODD", false, p)
        ));

        problemRepository.save(p);
    }

    private void seedProblem3() {
        Problem p = new Problem();
        p.setTitle("FizzBuzz");
        p.setDescription("Given N, for each number from 1 to N print Fizz if divisible by 3, Buzz if divisible by 5, FizzBuzz if both, else the number.");
        p.setInputFormat("A single integer N.");
        p.setOutputFormat("N lines of output.");
        p.setConstraints("1 <= N <= 1000");
        p.setDifficulty("MEDIUM");
        p.setRating(1200);
        p.setAvgSolvingTime(120);

        p.setTestCases(List.of(
                tc("5", "1\n2\nFizz\n4\nBuzz", true, p),
                tc("3", "1\n2\nFizz", true, p),
                tc("15", "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz", false, p),
                tc("1", "1", false, p)
        ));

        problemRepository.save(p);
    }

    private void seedProblem4() {
        Problem p = new Problem();
        p.setTitle("Reverse a String");
        p.setDescription("Given a string S, print it reversed.");
        p.setInputFormat("A single string S with no spaces.");
        p.setOutputFormat("Print the reversed string.");
        p.setConstraints("1 <= |S| <= 10^5");
        p.setDifficulty("MEDIUM");
        p.setRating(1400);
        p.setAvgSolvingTime(90);

        p.setTestCases(List.of(
                tc("hello", "olleh", true, p),
                tc("abcd", "dcba", true, p),
                tc("a", "a", false, p),
                tc("racecar", "racecar", false, p)
        ));

        problemRepository.save(p);
    }

    private void seedProblem5() {
        Problem p = new Problem();
        p.setTitle("Count Pairs with Given Sum");
        p.setDescription("Given an array of N integers and a target sum K, count the number of pairs (i, j) where i < j and arr[i] + arr[j] = K.");
        p.setInputFormat("First line: two integers N and K. Second line: N space-separated integers.");
        p.setOutputFormat("Print a single integer, the count of valid pairs.");
        p.setConstraints("1 <= N <= 10^4, -10^9 <= arr[i] <= 10^9");
        p.setDifficulty("HARD");
        p.setRating(1600);
        p.setAvgSolvingTime(300);

        p.setTestCases(List.of(
                tc("5 9\n1 2 3 4 5", "2", true, p),
                tc("4 6\n1 5 3 3", "2", true, p),
                tc("3 10\n1 2 3", "0", false, p),
                tc("6 0\n-1 1 -2 2 -3 3", "3", false, p)
        ));

        problemRepository.save(p);
    }

    private TestCase tc(String input, String expectedOutput, boolean isSample, Problem problem) {
        TestCase t = new TestCase();
        t.setInput(input);
        t.setExpectedOutput(expectedOutput);
        t.setSample(isSample);
        t.setProblem(problem);
        return t;
    }
}
