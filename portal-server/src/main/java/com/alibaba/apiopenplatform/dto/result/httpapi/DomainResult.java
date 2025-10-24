package com.alibaba.apiopenplatform.dto.result.httpapi;

import lombok.Builder;
import lombok.Data;

/**
 * @author zh
 */
@Data
@Builder
public class DomainResult {

    private String domain;

    private String protocol;

    private String networkType ;
}
