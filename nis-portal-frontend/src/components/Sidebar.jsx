export default function Sidebar() {
  return (
    <div className="flex h-screen w-[16%] flex-col overflow-y-hidden border-r border-gray-300 bg-white dark:bg-gray-900 dark:border-gray-800">
      <div className="mt-[100px] border-b border-gray-200 px-3 py-2">
        <h2 className="hidden text-xs font-semibold uppercase tracking-wide text-gray-500 lg:block">
          Navigation
        </h2>
      </div>

      <ul className="w-full">
        <li>
          <a href="/dashboard">
            <button className="flex w-full items-center justify-center px-3 py-3 text-2xl text-gray-700
                           transition-colors duration-150 ease-in-out hover:cursor-pointer
                           hover:border-l-[3px] hover:border-blue-500 hover:bg-blue-50
                           lg:justify-start lg:gap-x-3 dark:text-gray-200 dark:hover:bg-gray-800">
              <span className="material-symbols-outlined text-3xl lg:text-2xl">dashboard</span>
              <span className="hidden text-base lg:block">Dashboard</span>
            </button>
          </a>
        </li>

        <li>
          <a href="/requests">
            <button className="flex w-full items-center justify-center px-3 py-3 text-2xl text-gray-700
                           transition-colors duration-150 ease-in-out hover:cursor-pointer
                           hover:border-l-[3px] hover:border-blue-500 hover:bg-blue-50
                           lg:justify-start lg:gap-x-3">
              <span className="material-symbols-outlined text-3xl lg:text-2xl text-gray-700">list_alt</span>
              <span className="hidden text-base lg:block">Request</span>
            </button>
          </a>
        </li>

        <li>
          <a href="/new-request">
            <button className="flex w-full items-center justify-center px-3 py-3 text-2xl text-gray-700
                           transition-colors duration-150 ease-in-out hover:cursor-pointer
                           hover:border-l-[3px] hover:border-blue-500 hover:bg-blue-50
                           lg:justify-start lg:gap-x-3">
              <span className="material-symbols-outlined text-3xl lg:text-2xl text-gray-700">add_circle</span>
              <span className="hidden text-base lg:block">New Request</span>
            </button>
          </a>
        </li>

        <li>
          <a href="/reports">
            <button className="flex w-full items-center justify-center px-3 py-3 text-2xl text-gray-700
                           transition-colors duration-150 ease-in-out hover:cursor-pointer
                           hover:border-l-[3px] hover:border-blue-500 hover:bg-blue-50
                           lg:justify-start lg:gap-x-3">
              <span className="material-symbols-outlined text-3xl lg:text-2xl text-gray-700">analytics</span>
              <span className="hidden text-base lg:block">Reports</span>
            </button>
          </a>
        </li>

        {localStorage.getItem('role') === '1' ? (
          <li>
            <a href="/administration">
              <button className="flex w-full items-center justify-center px-3 py-3 text-2xl text-gray-700
                             transition-colors duration-150 ease-in-out hover:cursor-pointer
                             hover:border-l-[3px] hover:border-blue-500 hover:bg-blue-50
                             lg:justify-start lg:gap-x-3">
                <span className="material-symbols-outlined text-3xl lg:text-2xl text-gray-700">admin_panel_settings</span>
                <span className="hidden text-base lg:block">Administration</span>
              </button>
            </a>
          </li>
        ) : null}

        <li>
          <a href="/help">
            <button className="flex w-full items-center justify-center px-3 py-3 text-2xl text-gray-700
                           transition-colors duration-150 ease-in-out hover:cursor-pointer
                           hover:border-l-[3px] hover:border-blue-500 hover:bg-blue-50
                           lg:justify-start lg:gap-x-3">
              <span className="material-symbols-outlined text-3xl lg:text-2xl text-gray-700">help</span>
              <span className="hidden text-base lg:block">Help</span>
            </button>
          </a>
        </li>

        <li className="mt-2 border-t border-gray-200 pt-2 dark:border-gray-800">
          <a href="/login">
            <button className="flex w-full items-center justify-center px-3 py-3 text-red-600
                           transition-colors duration-150 ease-in-out hover:cursor-pointer
                           hover:border-l-[3px] hover:border-red-500 hover:bg-red-50
                           lg:justify-start lg:gap-x-3">
              <span className="material-symbols-outlined text-3xl lg:text-2xl text-red-600">logout</span>
              <span className="hidden text-base font-semibold lg:block">Logout</span>
            </button>
          </a>
        </li>
      </ul>
    </div>
  );
}
