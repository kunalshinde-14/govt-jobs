export default function LoginModal({ onClose, onLogin }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-sm border">

        <h2 className="text-lg font-semibold mb-2">
          Want to save this job?
        </h2>

        <p className="text-sm text-gray-500 mb-4">
          Sign in so you don't lose it later.
        </p>

        <button
          onClick={onLogin}
          className="w-full bg-amber-600 text-white py-2 rounded-lg mb-2"
        >
          Sign In (Demo)
        </button>

        <button
          onClick={onClose}
          className="w-full text-sm text-gray-500"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}