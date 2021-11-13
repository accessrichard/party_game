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

  defp add(num_range \\ 50) do
    max = num_range * 2
    num1 = :rand.uniform(num_range)
    num2 = :rand.uniform(num_range)
    correct = num1 + num2
    answers = gen_answers([correct], max)

    %Question{
      question: "#{num1} + #{num2}",
      answers: Enum.take_random(answers, 4),
      correct: Integer.to_string(correct)
    }
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
      correct: Integer.to_string(correct)
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
      correct: Integer.to_string(correct)
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
      correct: Integer.to_string(quotient)
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
