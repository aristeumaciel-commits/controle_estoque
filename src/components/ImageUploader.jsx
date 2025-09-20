export default function ImageUploader({ label, file, url, onFileChange }) {
  return (
    <div className="flex flex-col">
      <label className="mb-1">{label}</label>
      {url && (
        <img src={url} alt={label} className="w-24 h-24 object-cover mb-2" />
      )}
      <input type="file" accept="image/*" onChange={e => onFileChange(e.target.files[0])} />
    </div>
  )
}
