package com.gruppo12.trading_tool.controller;

import com.gruppo12.trading_tool.dto.CounterTradeRequest;
import com.gruppo12.trading_tool.dto.CreateTradeRequest;
import com.gruppo12.trading_tool.dto.TradeResponse;
import com.gruppo12.trading_tool.service.TradeService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/trades")
public class TradeController {

    private final TradeService tradeService;

    public TradeController(TradeService tradeService) {
        this.tradeService = tradeService;
    }

    @PostMapping
    public TradeResponse createTrade(@AuthenticationPrincipal String username,
                                     @RequestHeader(value = "Authorization", required = false) String authHeader,
                                     @Valid @RequestBody CreateTradeRequest request) {
        return new TradeResponse(tradeService.createTrade(username, authHeader, request));
    }

    @GetMapping("/incoming")
    public List<TradeResponse> getIncoming(@AuthenticationPrincipal String username) {
        return tradeService.getIncomingTrades(username)
                .stream()
                .map(TradeResponse::new)
                .toList();
    }

    @GetMapping("/outgoing")
    public List<TradeResponse> getOutgoing(@AuthenticationPrincipal String username) {
        return tradeService.getOutgoingTrades(username)
                .stream()
                .map(TradeResponse::new)
                .toList();
    }

    @GetMapping("/{id}")
    public TradeResponse getTrade(@PathVariable String id,
                                  @AuthenticationPrincipal String username) {
        return new TradeResponse(tradeService.getTrade(id, username));
    }

    @PostMapping("/{id}/accept")
    public TradeResponse acceptTrade(@PathVariable String id,
                                     @AuthenticationPrincipal String username,
                                     @RequestHeader(value = "Authorization", required = false) String authHeader) {
        return new TradeResponse(tradeService.acceptTrade(id, username, authHeader));
    }

    @PostMapping("/{id}/reject")
    public TradeResponse rejectTrade(@PathVariable String id,
                                     @AuthenticationPrincipal String username) {
        return new TradeResponse(tradeService.rejectTrade(id, username));
    }

    @PostMapping("/{id}/cancel")
    public TradeResponse cancelTrade(@PathVariable String id,
                                     @AuthenticationPrincipal String username) {
        return new TradeResponse(tradeService.cancelTrade(id, username));
    }

    @PostMapping("/{id}/counter")
    public TradeResponse counterTrade(@PathVariable String id,
                                      @AuthenticationPrincipal String username,
                                      @RequestHeader(value = "Authorization", required = false) String authHeader,
                                      @Valid @RequestBody CounterTradeRequest request) {
        return new TradeResponse(tradeService.counterTrade(id, username, authHeader, request));
    }

    @PostMapping("/{id}/complete")
    public TradeResponse completeTrade(@PathVariable String id,
                                       @AuthenticationPrincipal String username,
                                       @RequestHeader(value = "Authorization", required = false) String authHeader) {
        return new TradeResponse(tradeService.completeTrade(id, username, authHeader));
    }
}