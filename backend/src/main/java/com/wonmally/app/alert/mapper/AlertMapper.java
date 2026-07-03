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
    @Mapping(target = "address", source = "location.address")
    @Mapping(target = "citizenFirstName", source = "citizen.user.firstName")
    @Mapping(target = "citizenLastName", source = "citizen.user.lastName")
    @Mapping(target = "citizenPhone", source = "citizen.user.phone")
    @Mapping(target = "bloodGroup", source = "citizen.bloodGroup")
    AlertResponse toResponse(Alert alert);
}
