#Usa un'immagine Maven per costruire l'applicazione
FROM maven:3.9.4-eclipse-temurin-21 AS build
LABEL maintaner="gruppo12"

# Imposta la directory di lavoro
WORKDIR /app

# Copia i file Maven e scarica le dipendenze
COPY pom.xml .
COPY src ./src

# Costruisci il progetto Spring Boot
RUN mvn clean package -DskipTests

# Secondo stage: immagine più leggera per l'esecuzione
FROM eclipse-temurin:21-jdk

# Directory dell'app
WORKDIR /app

# Copia il file jar dal primo stage
COPY --from=build /app/target/gestione_utente-0.0.1-SNAPSHOT.jar app.jar

# Esponi la porta del servizio (modifica se non è 8080)
EXPOSE 8081

# Comando di avvio
ENTRYPOINT ["java", "-jar", "app.jar"]