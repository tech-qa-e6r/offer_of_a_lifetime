using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class SetupCardSlot : MonoBehaviour
{
    [Header("Настройки слота")]
    public SetupCategory category; // Какую категорию тянет этот слот

    [Header("UI Элементы")]
    public GameObject cardBack; // Объект "Рубашка" карты
    public TextMeshProUGUI titleText; // Текст названия
    public TextMeshProUGUI descriptionText; // Текст истории

    private bool isRevealed = false;

    void Start()
    {
        titleText.gameObject.SetActive(false);
        descriptionText.gameObject.SetActive(false);
    }

    public void OnSlotClicked()
    {
        if (isRevealed) return;
        GameManager.Instance.DrawSetupCard(this);
    }

    public void RevealCard(SetupCardData data)
    {
        titleText.gameObject.SetActive(true);
        descriptionText.gameObject.SetActive(true);
        titleText.text = data.cardName;
        descriptionText.text = data.backgroundStory;
        cardBack.SetActive(false);
        isRevealed = true;
    }
}