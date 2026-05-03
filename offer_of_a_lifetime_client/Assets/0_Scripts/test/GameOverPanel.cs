using UnityEngine;
using TMPro;
using UnityEngine.SceneManagement;

public class GameOverPanel : MonoBehaviour
{
    public TextMeshProUGUI resultText;
    public TextMeshProUGUI statsText;

    public void Show(bool won, int money, int attempts, int successes)
    {
        resultText.text = won ? "🎉 Оффер получен!" : "⏳ Время вышло...";
        resultText.color = won
            ? new UnityEngine.Color(1f, 0.8392f, 0.4196f)
            : new UnityEngine.Color(0.9725f, 0.4431f, 0.4431f);
        statsText.text = $"Деньги: {money}$\nПопыток: {attempts}  |  Успехов: {successes}";
        gameObject.SetActive(true);
    }

    public void OnRestartClicked()
    {
        SceneManager.LoadScene(SceneManager.GetActiveScene().name);
    }
}
