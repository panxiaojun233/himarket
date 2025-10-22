package com.alibaba.apiopenplatform.dto.result;

import com.aliyun.sdk.service.apig20240327.models.HttpRoute;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * @author zh
 */
@Data
public class AgentConfigResult {

    private AgentAPIConfig agentAPIConfig;

    @Data
    @Builder
    public static class AgentAPIConfig {
        /**
         * for AI gateway
         */
        private List<String> agentProtocols;
        private List<Route> routes;
    }

    @Data
    @Builder
    public static class Domain {
        private String domain;
        private String protocol;
    }

    @Data
    @Builder
    public static class Route {
        private List<Domain> domains;
        private String description;
        private RouteMatch match;

        public static Route from(HttpRoute route) {
            // domains
            List<Domain> domains = route.getDomainInfos().stream()
                    .map(domainInfo -> Domain.builder()
                            .domain(domainInfo.getName())
                            .protocol(domainInfo.getProtocol())
                            .build())
                    .collect(Collectors.toList());

            // path
            RouteMatchPath matchPath = Optional.ofNullable(route.getMatch().getPath())
                    .map(path -> RouteMatchPath.builder()
                            .value(path.getValue())
                            .type(path.getType())
                            .build())
                    .orElse(null);

            // headers
            List<RouteMatchHeader> matchHeaders = Optional.ofNullable(route.getMatch().getHeaders())
                    .map(headers -> headers.stream()
                            .map(header -> RouteMatchHeader.builder()
                                    .name(header.getName())
                                    .type(header.getType())
                                    .value(header.getValue())
                                    .build())
                            .collect(Collectors.toList()))
                    .orElse(null);

            // queryParams
            List<RouteMatchQuery> matchQueries = Optional.ofNullable(route.getMatch().getQueryParams())
                    .map(params -> params.stream()
                            .map(param -> RouteMatchQuery.builder()
                                    .name(param.getName())
                                    .type(param.getType())
                                    .value(param.getValue())
                                    .build())
                            .collect(Collectors.toList()))
                    .orElse(null);

            // build routeMatch
            RouteMatch routeMatch = RouteMatch.builder()
                    .methods(route.getMatch().getMethods())
                    .path(matchPath)
                    .headers(matchHeaders)
                    .queryParams(matchQueries)
                    .build();

            return Route.builder()
                    .domains(domains)
                    .description(route.getDescription())
                    .match(routeMatch)
                    .build();
        }
    }

    @Data
    @Builder
    public static class RouteMatch {
        private List<String> methods;
        private RouteMatchPath path;

        private List<RouteMatchHeader> headers;
        private List<RouteMatchQuery> queryParams;
    }

    @Data
    @Builder
    public static class RouteMatchPath {
        private String value;
        private String type;
    }

    @Data
    @Builder
    public static class RouteMatchHeader {
        private String name;
        private String type;
        private String value;
    }

    @Data
    @Builder
    public static class RouteMatchQuery {
        private String name;
        private String type;
        private String value;
    }
}

