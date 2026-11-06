/**
 * 팀 공유 캘린더 기록 타입 정의
 */

export type CategoryType = 'schedule' | 'flight' | 'maintenance';

export interface BaseRecord {
  id: string;
  category: CategoryType;
  date: string; // YYYY-MM-DD
  author: string; // 작성자 이름
  createdAt: string; // ISO String
}

// 1. 스케줄 기록
export interface ScheduleRecord extends BaseRecord {
  category: 'schedule';
  time: string; // HH:mm
  title: string; // 일정 제목
  memo?: string; // 상세 메모
}

// 2. 비행 기록
export interface FlightRecord extends BaseRecord {
  category: 'flight';
  aircraftNumber: string; // 기체 번호 (예: HL-1234)
  flightDuration: string; // 비행 시간 (예: 01:30)
  purposeAndRoute: string; // 비행 목적 및 경로
}

// 3. 정비 작업
export interface MaintenanceRecord extends BaseRecord {
  category: 'maintenance';
  partOrItem: string; // 정비 부위 / 항목
  details: string; // 정비 세부내용
  status: '진행중' | '완료'; // 상태
}

export type TeamRecord = ScheduleRecord | FlightRecord | MaintenanceRecord;

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
