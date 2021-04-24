defmodule PartyGame.Games.BuildYourOwn do
  alias PartyGame.Question

  def new(number_questions \\ 10) do
  end

  def parse(text) do
    lines = String.split(text, ~r/\R/)
    parse_lines(lines)
  end

  def parse_lines(list) do
    parse_lines(list, [])
  end

  def parse_lines([head | tail], question_list) do
    q = parse_line(head, question_list)
    parse_lines(tail, q)
  end

  def parse_lines([], question_list), do: question_list

  def parse_line("question:" <> rest, question_list),  do: parse_question(rest, question_list)
  def parse_line("Question:" <> rest, question_list),  do: parse_question(rest, question_list)
  def parse_line("Correct:" <> rest, question_list),  do: parse_correct(rest, question_list)
  def parse_line("correct:" <> rest, question_list),  do: parse_correct(rest, question_list)
  def parse_line("Answer:" <> rest, question_list),  do: parse_answer(rest, question_list)
  def parse_line("answer:" <> rest, question_list),  do: parse_answer(rest, question_list)
  def parse_line(_, question_list),  do: question_list


  def parse_question(rest, question_list) do
    question = String.trim(rest)
  end

  def parse_answer(rest, question_list) do
    question = String.trim(rest)
  end

  def parse_correct(rest, question_list) do
    question = String.trim(rest)
  end
end
