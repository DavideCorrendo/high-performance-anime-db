package com.example.dataserverspringboot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class DataServerSpringbootApplication {

  public static void main(String[] args) {
    SpringApplication.run(DataServerSpringbootApplication.class, args);
  }
}
