package com.vedansh.smssyncserver.repository;

import com.vedansh.smssyncserver.entity.SmsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SmsRepository extends JpaRepository<SmsEntity, Long> {

    List<SmsEntity> findAllByOrderByIdDesc();
}