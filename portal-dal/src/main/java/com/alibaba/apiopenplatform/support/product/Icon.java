package com.alibaba.apiopenplatform.support.product;

import com.alibaba.apiopenplatform.support.enums.IconType;
import lombok.Data;

/**
 * @author zh
 */
@Data
public class Icon {

    private IconType type;

    private String value;
}
