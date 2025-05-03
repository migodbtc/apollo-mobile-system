-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: localhost    Database: apollo_system
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.28-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `fire_statistics`
--

DROP TABLE IF EXISTS `fire_statistics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fire_statistics` (
  `FS_statistic_id` int(11) NOT NULL AUTO_INCREMENT,
  `FS_last_update` date DEFAULT NULL,
  `FS_total_fires` int(11) DEFAULT 0,
  `FS_false_alarms` int(11) DEFAULT 0,
  `FS_detected_fires` int(11) DEFAULT 0,
  `FS_average_confidence` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`FS_statistic_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `media_storage`
--

DROP TABLE IF EXISTS `media_storage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `media_storage` (
  `MS_media_id` int(11) NOT NULL AUTO_INCREMENT,
  `MS_user_owner` int(11) DEFAULT NULL,
  `MS_file_type` varchar(50) DEFAULT NULL,
  `MS_file_name` varchar(255) DEFAULT NULL,
  `MS_file_data` longblob DEFAULT NULL,
  PRIMARY KEY (`MS_media_id`)
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `postverified_reports`
--

DROP TABLE IF EXISTS `postverified_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `postverified_reports` (
  `VR_verification_id` int(11) NOT NULL AUTO_INCREMENT,
  `VR_report_id` int(11) DEFAULT NULL,
  `VR_confidence_score` decimal(5,2) DEFAULT NULL,
  `VR_detected` tinyint(1) DEFAULT NULL,
  `VR_verification_timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `VR_severity_level` enum('low','moderate','high','critical') DEFAULT NULL,
  `VR_spread_potential` enum('low','moderate','high') DEFAULT NULL,
  `VR_fire_type` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`VR_verification_id`),
  KEY `VR_report_id` (`VR_report_id`),
  CONSTRAINT `postverified_reports_ibfk_1` FOREIGN KEY (`VR_report_id`) REFERENCES `preverified_reports` (`PR_report_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `preverified_reports`
--

DROP TABLE IF EXISTS `preverified_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `preverified_reports` (
  `PR_report_id` int(11) NOT NULL AUTO_INCREMENT,
  `PR_user_id` int(11) DEFAULT NULL,
  `PR_image` int(11) DEFAULT NULL,
  `PR_video` int(11) DEFAULT NULL,
  `PR_latitude` decimal(10,8) DEFAULT NULL,
  `PR_longitude` decimal(11,8) DEFAULT NULL,
  `PR_address` text DEFAULT NULL,
  `PR_timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `PR_verified` tinyint(1) DEFAULT 0,
  `PR_report_status` enum('pending','verified','false_alarm','resolved') DEFAULT NULL,
  PRIMARY KEY (`PR_report_id`),
  KEY `PR_user_id` (`PR_user_id`),
  KEY `PR_image` (`PR_image`),
  KEY `PR_video` (`PR_video`),
  CONSTRAINT `preverified_reports_ibfk_1` FOREIGN KEY (`PR_user_id`) REFERENCES `user_accounts` (`UA_user_id`),
  CONSTRAINT `preverified_reports_ibfk_2` FOREIGN KEY (`PR_image`) REFERENCES `media_storage` (`MS_media_id`),
  CONSTRAINT `preverified_reports_ibfk_3` FOREIGN KEY (`PR_video`) REFERENCES `media_storage` (`MS_media_id`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `response_logs`
--

DROP TABLE IF EXISTS `response_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `response_logs` (
  `RL_response_id` int(11) NOT NULL AUTO_INCREMENT,
  `RL_verified_report_id` int(11) DEFAULT NULL,
  `RL_response_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `RL_response_status` enum('dispatched','arrived','resolved') DEFAULT NULL,
  PRIMARY KEY (`RL_response_id`),
  KEY `RL_verified_report_id` (`RL_verified_report_id`),
  CONSTRAINT `response_logs_ibfk_1` FOREIGN KEY (`RL_verified_report_id`) REFERENCES `postverified_reports` (`VR_verification_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_accounts`
--

DROP TABLE IF EXISTS `user_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_accounts` (
  `UA_user_id` int(11) NOT NULL AUTO_INCREMENT,
  `UA_username` varchar(255) DEFAULT NULL,
  `UA_password` varchar(255) DEFAULT NULL,
  `UA_user_role` enum('civilian','responder','sysad') DEFAULT NULL,
  `UA_created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `UA_last_name` varchar(255) DEFAULT NULL,
  `UA_first_name` varchar(255) DEFAULT NULL,
  `UA_middle_name` varchar(255) DEFAULT NULL,
  `UA_suffix` varchar(50) DEFAULT NULL,
  `UA_email_address` varchar(255) DEFAULT NULL,
  `UA_phone_number` varchar(255) DEFAULT NULL,
  `UA_reputation_score` int(11) DEFAULT 0,
  `UA_id_picture_front` int(11) DEFAULT NULL,
  `UA_id_picture_back` int(11) DEFAULT NULL,
  PRIMARY KEY (`UA_user_id`),
  UNIQUE KEY `UA_username` (`UA_username`),
  UNIQUE KEY `UA_email_address` (`UA_email_address`),
  UNIQUE KEY `UA_phone_number` (`UA_phone_number`),
  KEY `UA_id_picture_front` (`UA_id_picture_front`),
  KEY `UA_id_picture_back` (`UA_id_picture_back`),
  CONSTRAINT `user_accounts_ibfk_1` FOREIGN KEY (`UA_id_picture_front`) REFERENCES `media_storage` (`MS_media_id`),
  CONSTRAINT `user_accounts_ibfk_2` FOREIGN KEY (`UA_id_picture_back`) REFERENCES `media_storage` (`MS_media_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-04  1:27:02
