package io.nlo.coins;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Objects;

final class GrantClient {
    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(8))
            .build();
    private final String hubUrl;
    private final String secret;

    GrantClient(String hubUrl, String secret) {
        this.hubUrl = Objects.requireNonNull(hubUrl, "hubUrl").replaceAll("/+$", "");
        this.secret = Objects.requireNonNull(secret, "secret");
    }

    List<GrantModels.Grant> pending() throws Exception {
        HttpResponse<String> response = send(
                HttpRequest.newBuilder(URI.create(hubUrl + "/api/internal/coin-grants/pending"))
                        .timeout(Duration.ofSeconds(10))
                        .header("Authorization", "Bearer " + secret)
                        .header("Accept", "application/json")
                        .GET()
                        .build());
        if (response.statusCode() >= 400) {
            throw new IllegalStateException("pending HTTP " + response.statusCode());
        }
        return GrantModels.parsePending(response.body());
    }

    boolean claim(long id) throws Exception {
        return post(id + "/claim", "{}") == 200;
    }

    boolean delivered(long id, String ign) throws Exception {
        int status = post(id + "/delivered", "{\"ign\":\"" + jsonEscape(ign) + "\"}");
        return status == 200;
    }

    void release(long id) {
        try {
            post(id + "/release", "{}");
        } catch (Exception ignored) {
            // Next poll retries the lease.
        }
    }

    private int post(String suffix, String body) throws Exception {
        HttpResponse<String> response = send(
                HttpRequest.newBuilder(URI.create(hubUrl + "/api/internal/coin-grants/" + suffix))
                        .timeout(Duration.ofSeconds(10))
                        .header("Authorization", "Bearer " + secret)
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(body))
                        .build());
        return response.statusCode();
    }

    private HttpResponse<String> send(HttpRequest request) throws Exception {
        return http.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private static String jsonEscape(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
