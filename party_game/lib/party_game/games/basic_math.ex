defmodule PartyGame.Games.BasicMath do
  alias PartyGame.Question

  def new(number_questions \\ 10) do
    percentage_of_each = ceil(number_questions / 3)
    addition = new_addition(percentage_of_each)
    subtraction = new_subtraction(percentage_of_each)
    multiplication = new_multiply(percentage_of_each)

    combined = addition ++ subtraction ++ multiplication
    Enum.take_random(combined, number_questions)
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

  defp gen_answers(list, max) do
    if (length(list) >= 4) do
      list
    else
      new_list = [unique_num(max, list) | list]
      gen_answers(new_list, max)
    end
  end

  defp unique_num(max_value, existing_nums) do
    new = :rand.uniform(max_value)
    if (Enum.member?(existing_nums, new)) do
      unique_num(max_value, existing_nums)
    else
      new
    end
  end
end
