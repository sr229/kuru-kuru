export default function Footer() {
  const year = new Date().getFullYear().toString();

  return (
    <footer class="bottom-0 left-0 z-20 w-full p-4 bg-white border-t border-gray-300 md:flex md:items-center md:justify-between md:p-6">
      <span class="text-sm text-gray-500 sm:text-center">
        &copy; {year}{" "}
        <a href="https://git.io/sr229" class="hover:underline">Ayase Minori</a>.
        All Rights Reserved. Licensed under MIT.
      </span>
      <ul class="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 sm:mt-0">
        <li>
          <a
            href="https://github.com/sr229/kuru-kuru"
            class="mr-4 hover:underline md:mr-6"
          >
            GitHub Repo
          </a>
        </li>
        <li>
          <a
            href="https://duiqt.github.io/herta_kuru/"
            class="mr-4 hover:underline md:mr-6"
          >
            Visit the original!
          </a>
        </li>
      </ul>
    </footer>
  );
}
