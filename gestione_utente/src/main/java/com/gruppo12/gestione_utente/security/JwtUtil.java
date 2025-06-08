package com.gruppo12.gestione_utente.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;
import java.security.Key;
import java.util.Base64;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtUtil {
    @Value("${jwt.secret}")
    private String secret;
    private Key secretKey;
    private final long EXPIRATION_MS = 3600_000; // 1 ora

    @PostConstruct
    public void init(){
        secretKey = Keys.hmacShaKeyFor(Base64.getDecoder().decode(secret));
    }

    public String extractUsername(String token){
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token){
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims,T> f){
        return f.apply(Jwts.parserBuilder().setSigningKey(secretKey).build().parseClaimsJws(token).getBody());
    }

    public boolean validateToken(String token, String username){
        return extractUsername(token).equals(username) && extractExpiration(token).after(new Date());
    }
}

