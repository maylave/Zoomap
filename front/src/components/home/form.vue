<template>
  <section id="form" class="bg-forest-400 px-6 py-24 lg:px-16">
    <div
      class="mx-auto max-w-4xl rounded-[2rem] border border-accent/20 bg-accent/5 p-8 backdrop-blur-sm lg:p-12"
    >
      <div class="text-center">
        <span
          class="inline-flex rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-medium text-accent"
        >
          Оставайтесь на связи
        </span>

        <h2 class="mt-6 text-4xl font-bold text-cream-100 md:text-5xl">
  Получайте новости
  <span class="inline-flex items-center gap-3 text-accent">
    первыми
    <i class="fa-solid fa-paw text-2xl"></i>
  </span>
</h2>

        <p
          class="mx-auto mt-4 max-w-2xl text-cream-100/60"
        >
          Анонсы событий, рождение детёнышей,
          скидки на билеты и эксклюзивные акции.
          Только самое важное — без спама.
        </p>
      </div>

      <form
        class="mt-10 flex flex-col gap-5"
      >
        <div class="grid gap-5 md:grid-cols-2">
          <label class="floating-label">
            <span>Ваше имя</span>

            <input
              type="text"
              placeholder="Иван"
              class="input input-bordered w-full rounded-2xl	"
            >
          </label>

          <label class="floating-label">
            <span>Email</span>

            <input
              type="email"
              placeholder="mail@example.com"
              class="input input-bordered w-full
							rounded-2xl"
            >
          </label>
        </div>

        <label
          class="label cursor-pointer justify-start gap-3"
        >
          <input
            type="checkbox"
            checked
            class="checkbox checkbox-accent"
          >

          <span class="text-sm text-cream-100/70">
            Хочу получать новости и специальные предложения
          </span>
        </label>

       <button
  type="submit"
  class="btn btn-accent btn-lg rounded-full px-10"
>
  <i class="fa-solid fa-ticket mr-2"></i>
  Получить скидку 10%
</button>

        <p
          class="text-center text-xs text-cream-100/40"
        >
          Нажимая кнопку, вы соглашаетесь
          на обработку персональных данных.
        </p>
      </form>
    </div>
  </section>
</template>