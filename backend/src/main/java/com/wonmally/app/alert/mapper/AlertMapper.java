package com.wonmally.app.alert.mapper;

import com.wonmally.app.alert.dto.AlertResponse;
import com.wonmally.app.alert.entity.Alert;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AlertMapper {

    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "latitude", source = "location.latitude")
    @Mapping(target = "longitude", source = "location.longitude")
    AlertResponse toResponse(Alert alert);
}
