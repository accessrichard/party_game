defmodule PartyGame.Games.BasicMath do
  alias PartyGame.Game.Question

  def new(game, options \\ %{}) do
    type = Map.get(options, "type", "")
    number_questions = Map.get(game, :rounds, 10)

    case type do
      "addition" ->
        Enum.take_random(new_addition(number_questions), number_questions)

      "subtraction" ->
        Enum.take_random(new_subtraction(number_questions), number_questions)

      "multiplication" ->
        Enum.take_random(new_multiply(number_questions), number_questions)

      "division" ->
        Enum.take_random(new_division(number_questions), number_questions)

      "fraction_divide" ->
        Enum.take_random(new_fraction_divide(number_questions), number_questions)

      "fraction_multiply" ->
        Enum.take_random(new_fraction_multiply(number_questions), number_questions)

      _ ->
        percentage_of_each = ceil(number_questions / 4)
        addition = new_addition(percentage_of_each)
        subtraction = new_subtraction(percentage_of_each)
        multiplication = new_multiply(percentage_of_each)
        division = new_division(percentage_of_each)
        combined = addition ++ subtraction ++ multiplication ++ division
        Enum.take_random(combined, number_questions)
    end
  end

  def new_addition(number_questions \\ 10) do
    for _ <- 0..number_questions, do: add()
  end

  def new_subtraction(number_questions \\ 10) do
    for _ <- 0..number_questions, do: subtract()
  end

  def new_multiply(number_questions \\ 10) do
    for _ <- 0..number_questions, do: multiply()
  end

  def new_division(number_questions \\ 10) do
    for _ <- 0..number_questions, do: divide()
  end

  def new_fraction_divide(number_questions \\ 10) do
    for _ <- 0..number_questions, do: fraction(:divide)
  end

  def new_fraction_multiply(number_questions \\ 10) do
    for _ <- 0..number_questions, do: fraction(:multiply)
  end

  defp add(num_range \\ 50) do
    max = num_range * 2
    num1 = :rand.uniform(num_range)
    num2 = :rand.uniform(num_range)
    correct = num1 + num2
    answers = gen_answers([correct], max)

    %Question{
      question: "#{num1} + #{num2}",
      answers: Enum.take_random(answers, 4),
      correct: Integer.to_string(correct),
      id: Ecto.UUID.autogenerate()
    }
  end

  def fraction_answer(:divide, n1, n2, d1, d2), do: {n1 * d2, d1 * n2}
  def fraction_answer(:multiply, n1, n2, d1, d2), do: {n1 * n2, d1 * d2}

  def fraction(op, num_range \\ 10) do
    numerator1 = :rand.uniform(num_range)
    denominator1 = :rand.uniform(num_range)
    numerator2 = :rand.uniform(num_range)
    denominator2 = :rand.uniform(num_range)

    {numerator_answer, denominator_answer} =
      fraction_answer(op, numerator1, numerator2, denominator1, denominator2)

    gcd = greatest_common_denominator(numerator_answer, denominator_answer)
    numerator = numerator_answer / gcd
    denominator = denominator_answer / gcd

    sign = if op === :multiply, do: "*", else: "/"

    correct =
      "#{:erlang.float_to_binary(numerator, decimals: 0)} / #{:erlang.float_to_binary(denominator, decimals: 0)}"

    random_answers = gen_fractional_answers(numerator1, denominator1, numerator2, denominator2)

    answers =
      Enum.take_random(
        [
          correct | Enum.take_random(random_answers, 3)
        ],
        4
      )

    %Question{
      question: "#{numerator1} / #{denominator1}     #{sign}     #{numerator2} / #{denominator2}",
      answers: answers,
      correct: correct,
      id: Ecto.UUID.autogenerate()
    }
  end

  defp gen_fractional_answers(n1, d1, n2, d2) do
    max = max(n1 * n2, d1 * d1)

    rand =
      Enum.map(1..5, fn _ ->
        "#{:rand.uniform(max)} / #{:rand.uniform(max)}"
      end)

    rand ++
      [
        "#{n1 * n1} / #{:rand.uniform(max(d1, d2))}",
        "#{:rand.uniform(max(n1, n2))} / #{:rand.uniform(max(d1, d2))}",
        "#{:rand.uniform(max(n1, n2))} / #{d1 * d1}",
        "#{n1 * n2} / #{d1 * d2}",
        "#{n1 * d2} / #{n1 * d1}",
        "#{n1} / #{d1}",
        "#{n2} / #{d2}"
      ]
  end

  defp greatest_common_denominator(a, 0), do: a

  defp greatest_common_denominator(a, b) do
    greatest_common_denominator(b, Integer.mod(a, b))
  end

  defp subtract(num_range \\ 50) do
    max = num_range
    num1 = :rand.uniform(num_range)
    num2 = :rand.uniform(num_range)
    correct = max(num1, num2) - min(num1, num2)
    answers = gen_answers([correct], max)

    %Question{
      question: "#{max(num1, num2)} - #{min(num1, num2)}",
      answers: Enum.take_random(answers, 4),
      correct: Integer.to_string(correct),
      id: Ecto.UUID.autogenerate()
    }
  end

  defp multiply(num_range \\ 10) do
    max = num_range
    num1 = :rand.uniform(num_range)
    num2 = :rand.uniform(num_range)
    correct = num1 * num2
    answers = gen_answers([correct], max)

    %Question{
      question: "#{max(num1, num2)} * #{min(num1, num2)}",
      answers: Enum.take_random(answers, 4),
      correct: Integer.to_string(correct),
      id: Ecto.UUID.autogenerate()
    }
  end

  defp divide(num_range \\ 10) do
    max = num_range
    divisor = :rand.uniform(num_range)
    quotient = :rand.uniform(num_range)

    dividend = divisor * quotient
    answers = gen_answers([quotient], max)

    %Question{
      question: "#{dividend} / #{divisor}",
      answers: Enum.take_random(answers, 4),
      correct: Integer.to_string(quotient),
      id: Ecto.UUID.autogenerate()
    }
  end

  defp gen_answers(list, max) do
    if length(list) >= 4 do
      list
    else
      new_list = [unique_num(max, list) | list]
      gen_answers(new_list, max)
    end
  end

  defp unique_num(max_value, existing_nums) do
    new = :rand.uniform(max_value)

    if Enum.member?(existing_nums, new) do
      unique_num(max_value, existing_nums)
    else
      new
    end
  end
end
