
import React from 'react';

interface QuizInstructionsProps {
  onAccept: () => void;
  durationMinutes: number;
}

const QuizInstructions: React.FC<QuizInstructionsProps> = ({ onAccept, durationMinutes }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
      <div className="bg-white rounded-2xl shadow-xl shadow-teal-900/5 border border-teal-50 overflow-hidden">
        {/* Header */}
        <div className="bg-[#016569] px-8 py-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white blur-3xl"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-[#ffdd00] blur-3xl"></div>
          </div>
          
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
              <span className="w-2 h-2 rounded-full bg-[#ffdd00] animate-pulse"></span>
              <span className="text-[10px] font-black text-teal-50 uppercase tracking-[0.2em]">Penting</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
              Petunjuk <span className="text-[#ffdd00]">Pengerjaan</span>
            </h1>
            <p className="text-teal-50/70 text-sm font-medium max-w-lg mx-auto">
              Mohon baca dengan teliti setiap bagian sebelum memulai ujian atau mengisi data diri Anda.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 md:p-12 space-y-12">
          
          {/* Section 1 */}
          <section className="relative pl-12">
            <div className="absolute left-0 top-0 w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center text-[#016569] font-black italic">
              1
            </div>
            <h2 className="text-lg font-black text-teal-900 uppercase tracking-tight mb-4 flex items-center gap-2">
              Persiapan Awal
              <div className="h-px flex-1 bg-teal-50 ml-2"></div>
            </h2>
            <ul className="space-y-3">
              <li className="flex gap-3 text-sm text-teal-700/80 leading-relaxed font-medium">
                <i className="fas fa-check-circle text-teal-400 mt-1"></i>
                <span><strong className="text-teal-900">Identitas Digital:</strong> Pastikan Anda telah masuk (login) ke akun siswa atau mengisi kolom profil (Nama, Kelas, No. Absen) sebelum memulai.</span>
              </li>
              {durationMinutes > 0 && (
                <li className="flex gap-3 text-sm text-teal-700/80 leading-relaxed font-medium">
                  <i className="fas fa-check-circle text-teal-400 mt-1"></i>
                  <span><strong className="text-teal-900">Waktu:</strong> Anda memiliki waktu {durationMinutes} menit. Timer akan berjalan otomatis setelah tombol "Mulai" ditekan.</span>
                </li>
              )}
              <li className="flex gap-3 text-sm text-teal-700/80 leading-relaxed font-medium">
                <i className="fas fa-check-circle text-teal-400 mt-1"></i>
                <span><strong className="text-teal-900">Koneksi:</strong> Pastikan koneksi internet stabil agar jawaban tersimpan dengan sempurna.</span>
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="relative pl-12">
            <div className="absolute left-0 top-0 w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center text-[#016569] font-black italic">
              2
            </div>
            <h2 className="text-lg font-black text-teal-900 uppercase tracking-tight mb-4 flex items-center gap-2">
              Struktur Soal (4-Tier System)
              <div className="h-px flex-1 bg-teal-50 ml-2"></div>
            </h2>
            <p className="text-xs text-teal-500 font-bold uppercase tracking-widest mb-4">Setiap butir soal memiliki 4 tahapan pengerjaan yang wajib diisi:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { tier: 'I', title: 'Jawaban', desc: 'Pilih jawaban yang menurut Anda paling tepat.' },
                { tier: 'II', title: 'Keyakinan Jawaban', desc: 'Pilih tingkat keyakinan Anda terhadap jawaban tersebut (Yakin/Tidak Yakin).' },
                { tier: 'III', title: 'Alasan', desc: 'Pilih alasan yang mendasari pilihan jawaban Anda di Tingkat 1.' },
                { tier: 'IV', title: 'Keyakinan Alasan', desc: 'Pilih tingkat keyakinan Anda terhadap alasan tersebut (Yakin/Tidak Yakin).' }
              ].map((item, idx) => (
                <div key={idx} className="bg-teal-50/50 p-4 rounded-xl border border-teal-50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-[#016569] bg-white px-2 py-0.5 rounded shadow-sm border border-teal-100">TIER {item.tier}</span>
                    <span className="text-sm font-black text-teal-900">{item.title}</span>
                  </div>
                  <p className="text-xs text-teal-700/70 font-medium leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3 */}
          <section className="relative pl-12">
            <div className="absolute left-0 top-0 w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center text-[#016569] font-black italic">
              3
            </div>
            <h2 className="text-lg font-black text-teal-900 uppercase tracking-tight mb-4 flex items-center gap-2">
              Teknis Aplikasi
              <div className="h-px flex-1 bg-teal-50 ml-2"></div>
            </h2>
            <ul className="space-y-4">
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-teal-50 flex-shrink-0 flex items-center justify-center text-teal-600">
                  <i className="fas fa-arrows-alt-h text-sm"></i>
                </div>
                <div>
                  <h4 className="text-sm font-black text-teal-900 uppercase tracking-tight">Navigasi</h4>
                  <p className="text-xs text-teal-700/70 font-medium mt-0.5">Gunakan tombol "Lanjut" untuk ke tahap berikutnya dan "Kembali" jika ingin mengecek ulang soal sebelumnya. Atau pilih nomor soal untuk menuju nomor soal yang diinginkan.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-teal-50 flex-shrink-0 flex items-center justify-center text-teal-600">
                  <i className="fas fa-lock text-sm"></i>
                </div>
                <div>
                  <h4 className="text-sm font-black text-teal-900 uppercase tracking-tight">Validasi</h4>
                  <p className="text-xs text-teal-700/70 font-medium mt-0.5">Pastikan semua tingkatan soal telah diisi sebelum melanjutkan ke soal berikutnya.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-teal-50 flex-shrink-0 flex items-center justify-center text-teal-600">
                  <i className="fas fa-headset text-sm"></i>
                </div>
                <div>
                  <h4 className="text-sm font-black text-teal-900 uppercase tracking-tight">Bantuan</h4>
                  <p className="text-xs text-teal-700/70 font-medium mt-0.5">Jika terjadi kendala teknis (aplikasi error/gambar tidak muncul), segera hubungi pengawas atau lambaikan tangan.</p>
                </div>
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="relative pl-12">
            <div className="absolute left-0 top-0 w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center text-[#016569] font-black italic">
              4
            </div>
            <h2 className="text-lg font-black text-teal-900 uppercase tracking-tight mb-4 flex items-center gap-2">
              Akhiri Ujian
              <div className="h-px flex-1 bg-teal-50 ml-2"></div>
            </h2>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1 bg-teal-50/30 p-5 rounded-xl border border-dashed border-teal-200">
                <h4 className="text-xs font-black text-teal-600 uppercase tracking-widest mb-2">Review</h4>
                <p className="text-xs text-teal-700 font-medium leading-relaxed">Periksalah kembali semua jawaban Anda jangan sampai ada soal yang terlewat.</p>
              </div>
              <div className="flex-1 bg-[#ffdd00]/10 p-5 rounded-xl border border-dashed border-[#ffdd00]/30">
                <h4 className="text-xs font-black text-[#016569] uppercase tracking-widest mb-2">Submit</h4>
                <p className="text-xs text-teal-700 font-medium leading-relaxed">Jawaban yang sudah dikirim (Submit) tidak dapat diubah kembali.</p>
              </div>
            </div>
          </section>

        </div>

        {/* Action */}
        <div className="bg-teal-50/50 p-8 border-t border-teal-50 flex flex-col items-center gap-4">
          <p className="text-[10px] text-teal-400 font-bold uppercase tracking-[0.2em] text-center">
            Dengan menekan tombol di bawah, Anda menyatakan telah memahami seluruh aturan ujian.
          </p>
          <button 
            onClick={onAccept}
            className="group relative bg-[#016569] hover:bg-[#015255] text-white px-10 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-teal-900/10 flex items-center gap-3"
          >
            <span>Saya Mengerti & Lanjutkan</span>
            <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizInstructions;
