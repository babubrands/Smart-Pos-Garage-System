import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.file.Files;
import java.nio.file.Path;

public class StaticServer {
    public static void main(String[] args) throws IOException {
        int port = args.length > 0 ? Integer.parseInt(args[0]) : 8080;
        Path root = Path.of(".").toAbsolutePath().normalize();

        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/", exchange -> handle(exchange, root));
        server.setExecutor(null);

        System.out.println("Babu Garage POS running at http://localhost:" + port);
        server.start();
    }

    private static void handle(HttpExchange exchange, Path root) throws IOException {
        String rawPath = exchange.getRequestURI().getPath();
        String requested = rawPath.equals("/") ? "/index.html" : rawPath;

        Path target = root.resolve("." + requested).normalize();
        if (!target.startsWith(root) || !Files.exists(target) || Files.isDirectory(target)) {
            sendText(exchange, 404, "Not found");
            return;
        }

        byte[] bytes = Files.readAllBytes(target);
        exchange.getResponseHeaders().set("Content-Type", guessMimeType(target));
        exchange.sendResponseHeaders(200, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static void sendText(HttpExchange exchange, int status, String message) throws IOException {
        byte[] bytes = message.getBytes();
        exchange.getResponseHeaders().set("Content-Type", "text/plain; charset=utf-8");
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static String guessMimeType(Path path) {
        String file = path.getFileName().toString().toLowerCase();
        if (file.endsWith(".html") || file.endsWith(".htm")) return "text/html; charset=utf-8";
        if (file.endsWith(".js")) return "application/javascript; charset=utf-8";
        if (file.endsWith(".css")) return "text/css; charset=utf-8";
        if (file.endsWith(".json")) return "application/json; charset=utf-8";
        if (file.endsWith(".png")) return "image/png";
        if (file.endsWith(".jpg") || file.endsWith(".jpeg")) return "image/jpeg";
        if (file.endsWith(".svg")) return "image/svg+xml";
        return "application/octet-stream";
    }
}
