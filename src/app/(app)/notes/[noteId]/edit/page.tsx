// src/app/notes/[noteId]/edit/page.tsx

// (ถ้าจำเป็น) import สิ่งที่ต้องใช้ เช่น React, hooks, components ฯลฯ
import React from 'react';

// 1. สร้างฟังก์ชันสำหรับดึง Note ID ทั้งหมดที่คุณต้องการให้สร้างหน้า Static ไว้
//    - คุณจะต้องปรับแก้ส่วนนี้ให้ดึงข้อมูลจากแหล่งข้อมูลจริงของคุณ (เช่น Firebase Firestore)
//    - ฟังก์ชันนี้ควรเป็น async function
async function getAllPossibleNoteIds() {
  // ตัวอย่าง: สมมติว่าคุณดึงข้อมูลมาจาก Firestore หรือ API อื่นๆ
  // นี่เป็นข้อมูลตัวอย่างแบบ hardcoded เพื่อให้เห็นภาพ
  // ในการใช้งานจริง คุณต้องแทนที่ส่วนนี้ด้วย logic การดึงข้อมูลของคุณ
  console.log('Fetching all note IDs for generateStaticParams...');
  // ตัวอย่างการคืนค่า (แต่ละ object ต้องมี key ตรงกับชื่อ dynamic parameter ของคุณ คือ noteId)
  const exampleNoteIds = [
    { noteId: 'note-abc' },
    { noteId: 'note-123' },
    { noteId: 'another-example-note' },
    // ... เพิ่ม noteId อื่นๆ ที่คุณมี
  ];
  // ถ้าไม่มีโน้ตเลย หรือไม่ต้องการ pre-render หน้าใดๆ ให้ return array ว่าง: return [];
  // แต่ถ้า return array ว่าง แล้วผู้ใช้เข้า path ที่ไม่มีในนี้ และไม่ได้ตั้งค่า fallback
  // มันจะกลายเป็นหน้า 404 ตอน export (ถ้า dynamicParams = true ซึ่งเป็น default)
  // หรือ build error (ถ้า dynamicParams = false)
  return exampleNoteIds;
}

// 2. เพิ่มฟังก์ชัน generateStaticParams
//    Next.js จะเรียกใช้ฟังก์ชันนี้ตอน build time เพื่อสร้าง path ต่างๆ
export async function generateStaticParams() {
  try {
    const notes = await getAllPossibleNoteIds(); // เรียกฟังก์ชันที่คุณสร้างเพื่อดึง ID ทั้งหมด

    // ตรวจสอบว่า notes เป็น array และมีข้อมูล
    if (!Array.isArray(notes) || notes.length === 0) {
      console.warn('generateStaticParams: No note IDs returned or notes is not an array. No static paths will be generated for /notes/[noteId]/edit.');
      return []; // คืนค่า array ว่างถ้าไม่มี ID หรือเกิดข้อผิดพลาดในการดึงข้อมูล
    }

    // map ข้อมูลให้ตรงกับ format ที่ Next.js ต้องการ
    // (array ของ objects ที่มี key เป็นชื่อ dynamic parameter)
    const paths = notes.map((note) => ({
      noteId: note.noteId, // 'noteId' ต้องตรงกับชื่อโฟลเดอร์ [noteId]
    }));
    console.log('Generated static params for /notes/[noteId]/edit:', paths);
    return paths;

  } catch (error) {
    console.error('Error in generateStaticParams for /notes/[noteId]/edit:', error);
    return []; // คืนค่า array ว่างในกรณีที่เกิด error เพื่อไม่ให้ build ล้มเหลว (แต่อาจจะไม่มีหน้า pre-render)
  }
}

// 3. สร้าง Page Component ของคุณ (ถ้ายังไม่มี หรือปรับแก้ของเดิม)
//    Component นี้จะรับ params ที่มี noteId เข้ามา
interface EditNotePageProps {
  params: {
    noteId: string; // 'noteId' ต้องตรงกับชื่อโฟลเดอร์ [noteId]
  };
}

export default function EditNotePage({ params }: EditNotePageProps) {
  const { noteId } = params;

  // ที่นี่คุณสามารถใช้ noteId เพื่อดึงข้อมูลของโน้ตนั้นๆ มาแสดงในฟอร์มแก้ไข
  // เช่น fetch data for this noteId

  return (
    <div>
      <h1>หน้าแก้ไขโน้ต</h1>
      <p>รหัสโน้ตที่กำลังแก้ไข: {noteId}</p>
      {/*
        ใส่ฟอร์มและ UI สำหรับการแก้ไขโน้ตที่นี่
        คุณอาจจะต้องใช้ useEffect เพื่อ fetch ข้อมูลของ noteId นี้เมื่อ component โหลด
      */}
      <form>
        <div>
          <label htmlFor="noteTitle">ชื่อโน้ต:</label>
          <input type="text" id="noteTitle" name="noteTitle" defaultValue={`หัวข้อของโน้ต ${noteId}`} />
        </div>
        <div>
          <label htmlFor="noteContent">เนื้อหา:</label>
          <textarea id="noteContent" name="noteContent" defaultValue={`เนื้อหาของโน้ต ${noteId}...`}></textarea>
        </div>
        <button type="submit">บันทึกการแก้ไข</button>
      </form>
    </div>
  );
}

// (Optional) ถ้าคุณต้องการให้ Next.js พยายามสร้างหน้าแบบ dynamic ถ้า path ไม่ได้ถูก generate ไว้ล่วงหน้า
// และคุณไม่ได้ใช้ `output: 'export'` อย่างเข้มงวด หรือใช้ร่วมกับ ISR
// คุณสามารถตั้งค่า `dynamicParams = true` (ซึ่งเป็น default)
// หรือ `dynamic = 'force-dynamic'` ใน page component หรือ layout
// แต่เมื่อใช้ `output: 'export'` การตั้งค่าเหล่านี้อาจมีผลที่แตกต่างออกไป
// โดยทั่วไป `output: 'export'` จะต้องการให้ทุก path ถูก generate ไว้ล่วงหน้า
// หรือถ้า path ไม่ได้ถูก generate มันจะกลายเป็น 404
//
// export const dynamicParams = true; // Default is true
// export const revalidate = 60; // ตัวอย่างการใช้ ISR (Incremental Static Regeneration)
