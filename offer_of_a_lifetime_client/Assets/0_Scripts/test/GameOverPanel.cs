using UnityEngine;
using TMPro;
using UnityEngine.SceneManagement;

public class GameOverPanel : MonoBehaviour
{
    public TextMeshProUGUI resultText;
    public TextMeshProUGUI statsText;

    public void Show(bool won, int money, int attempts, int successes)
    {
        resultText.text = won ? "Оффер получен!" : "Время вышло...";
        statsText.text = $"Деньги: {money}$\nПопыток: {attempts}  |  Успехов: {successes}";
        gameObject.SetActive(true);
    }

    public void OnRestartClicked()
    {
        SceneManager.LoadScene(SceneManager.GetActiveScene().name);
    }
}
