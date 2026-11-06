import { NextResponse } from 'next/server';
import { TeamRecord } from '@/types/record';

// 개발 및 테스트를 위한 인메모리 폴백 저장소
// (Google Apps Script URL이 설정되지 않았거나 연결 실패 시 사용)
let fallbackRecords: TeamRecord[] = [
  {
    id: 'demo-1',
    category: 'schedule',
    date: new Date().toISOString().slice(0, 10),
    author: '홍길동',
    time: '10:00',
    title: '오전 비행 전 브리핑',
    memo: '날씨 및 항로 최종 점검',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    category: 'flight',
    date: new Date().toISOString().slice(0, 10),
    author: '김철수',
    aircraftNumber: 'HL-7701',
    flightDuration: '01:30',
    purposeAndRoute: 'RKSI - RKSS 시계비행 훈련',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    category: 'maintenance',
    date: new Date().toISOString().slice(0, 10),
    author: '이영희',
    partOrItem: '좌측 프로펠러 및 엔진오일',
    details: '정기 점검 및 오일 교체 완료',
    status: '완료',
    createdAt: new Date().toISOString(),
  },
];

/**
 * GET: 전체 기록 조회
 */
export async function GET() {
  const scriptUrl = process.env.GOOGLE_SHEET_API_URL;

  if (scriptUrl && scriptUrl.trim() !== '') {
    try {
      const response = await fetch(scriptUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Google Apps Script fetch error: ${response.statusText}`);
      }

      const data = await response.json();
      return NextResponse.json({ success: true, data: Array.isArray(data) ? data : data.data || [] });
    } catch (err: any) {
      console.error('[API Proxy] Error fetching from Google Sheets:', err);
      // 실패 시 폴백 데이터 반환
      return NextResponse.json({
        success: true,
        data: fallbackRecords,
        warning: 'Google Sheets 연동 실패로 로컬 임시 데이터를 반환합니다.',
      });
    }
  }

  // Apps Script URL이 설정되지 않은 경우 로컬 메모리 데이터 반환
  return NextResponse.json({ success: true, data: fallbackRecords });
}

/**
 * POST: 기록 생성(action: 'create') 또는 삭제(action: 'delete')
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, payload } = body;
    const scriptUrl = process.env.GOOGLE_SHEET_API_URL;

    if (action === 'create') {
      const newRecord: TeamRecord = {
        ...payload,
        id: payload.id || `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: payload.createdAt || new Date().toISOString(),
      };

      if (scriptUrl && scriptUrl.trim() !== '') {
        try {
          const res = await fetch(scriptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'create', data: newRecord }),
          });
          const resData = await res.json();
          return NextResponse.json({ success: true, data: resData.data || newRecord });
        } catch (err) {
          console.error('[API Proxy] Error writing to Google Sheets:', err);
          fallbackRecords.unshift(newRecord);
          return NextResponse.json({
            success: true,
            data: newRecord,
            warning: 'Google Sheets 저장 실패로 임시 저장되었습니다.',
          });
        }
      }

      // 로컬 메모리 저장
      fallbackRecords.unshift(newRecord);
      return NextResponse.json({ success: true, data: newRecord });
    }

    if (action === 'delete') {
      const recordId = payload?.id;
      if (!recordId) {
        return NextResponse.json({ success: false, error: '삭제할 ID가 없습니다.' }, { status: 400 });
      }

      if (scriptUrl && scriptUrl.trim() !== '') {
        try {
          const res = await fetch(scriptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id: recordId }),
          });
          const resData = await res.json();
          return NextResponse.json({ success: true, data: resData });
        } catch (err) {
          console.error('[API Proxy] Error deleting from Google Sheets:', err);
          fallbackRecords = fallbackRecords.filter((item) => item.id !== recordId);
          return NextResponse.json({ success: true, data: { id: recordId } });
        }
      }

      // 로컬 메모리 삭제
      fallbackRecords = fallbackRecords.filter((item) => item.id !== recordId);
      return NextResponse.json({ success: true, data: { id: recordId } });
    }

    return NextResponse.json({ success: false, error: '유효하지 않은 action입니다.' }, { status: 400 });
  } catch (error: any) {
    console.error('[API Proxy] Internal error:', error);
    return NextResponse.json({ success: false, error: error.message || '서버 오류' }, { status: 500 });
  }
}
