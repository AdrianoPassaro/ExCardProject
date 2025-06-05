package com.gruppo12.card_loader;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling  // Abilita lo scheduling per l'approvazione automatica
public class CardLoaderApplication {

	public static void main(String[] args) {
		SpringApplication.run(CardLoaderApplication.class, args);
	}

}
