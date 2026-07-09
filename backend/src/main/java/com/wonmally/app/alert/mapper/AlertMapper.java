package com.wonmally.app.alert.mapper;

import com.wonmally.app.alert.dto.AlertResponse;
import com.wonmally.app.alert.entity.Alert;
import jakarta.persistence.EntityNotFoundException;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public abstract class AlertMapper {

    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "latitude", source = "location.latitude")
    @Mapping(target = "longitude", source = "location.longitude")
    @Mapping(target = "address", source = "location.address")
    @Mapping(target = "citizenId", expression = "java(safeCitizenId(alert))")
    @Mapping(target = "citizenFirstName", expression = "java(safeCitizenFirstName(alert))")
    @Mapping(target = "citizenLastName", expression = "java(safeCitizenLastName(alert))")
    @Mapping(target = "citizenPhone", expression = "java(safeCitizenPhone(alert))")
    @Mapping(target = "bloodGroup", expression = "java(safeBloodGroup(alert))")
    public abstract AlertResponse toResponse(Alert alert);

    protected java.util.UUID safeCitizenId(Alert alert) {
        try { return alert.getCitizen().getId(); } catch (EntityNotFoundException ex) { return null; }
    }

    protected String safeCitizenFirstName(Alert alert) {
        try { return alert.getCitizen().getUser().getFirstName(); } catch (EntityNotFoundException ex) { return "(compte supprime)"; }
    }

    protected String safeCitizenLastName(Alert alert) {
        try { return alert.getCitizen().getUser().getLastName(); } catch (EntityNotFoundException ex) { return ""; }
    }

    protected String safeCitizenPhone(Alert alert) {
        try { return alert.getCitizen().getUser().getPhone(); } catch (EntityNotFoundException ex) { return null; }
    }

    protected String safeBloodGroup(Alert alert) {
        try { return alert.getCitizen().getBloodGroup(); } catch (EntityNotFoundException ex) { return null; }
    }
}